import { Injectable } from '@nestjs/common'
import API from 'constant/api'
import { BOOKS_OBJECT_KEY } from 'constant/books.object.key'
import { TAG_KEY } from 'constant/tag.key'
import { getAllAfter } from 'helpers/getAllAfter'
import { Queue } from 'helpers/queue'
import { compact, get, isArray, reverse, sum, uniqBy } from 'lodash'

import { Scrap, JsonObject } from '../scrap'
import {
  ScrapBookReturn,
  ScrapVolumeAuthorReturn,
  BooksObjectKeyType,
  ScrapPublisherReturn,
  ScrapVolumeReturn,
} from './bbm.types'

@Injectable()
export class BBM {
  private loadApi = API.BBM
  private scrapping: Scrap
  private queue: Queue

  constructor() {
    this.scrapping = new Scrap()
    this.queue = new Queue(this.getBookVolume.bind(this))
  }

  async scrapBooks() {
    const loaded = await this.scrapping.load(this.loadApi)

    const { children } = this.scrapping.getByTag(loaded, TAG_KEY.TABLE_TBODY, 0)

    const books = this.getBooks(children)

    const publishers = this.getPublishers(books)

    return {
      publishers,
      books,
    }
  }

  async getBooksVolume(
    scrapped: ScrapBookReturn[],
  ): Promise<ScrapVolumeAuthorReturn[]> {
    const scrapVolumes: ScrapVolumeAuthorReturn[] = []
    scrapped.map((scrap) =>
      this.queue.instance.push(scrap, (_, result: ScrapVolumeAuthorReturn) =>
        scrapVolumes.push(result),
      ),
    )

    await this.queue.instance.drain()

    return scrapVolumes
  }

  async getBookVolume(scrap: ScrapBookReturn) {
    const page = await this.scrapping.load(scrap.url)

    const author = this.scrapping
      .getElementByText(page, BOOKS_OBJECT_KEY.AUTHOR, 'strong')[0]
      .next.data?.replace(':', '')
      ?.trimStart()

    const table = this.getAllTables(page)

    const numberOfVolumesInBrazil = reverse(
      this.getNumberOfVolumesInBrazil(table, page),
    )

    const matchingPosition = scrap.dupIndex || 0

    const current = numberOfVolumesInBrazil[matchingPosition]

    // const totalSum = sum(numberOfVolumesInBrazil) - current

    const previousSum = sum(getAllAfter(numberOfVolumesInBrazil, current))

    const currentTable = reverse([...table])[matchingPosition]?.children.splice(
      0,
      current,
    )

    const volumesScrapped = this.scrapVolumes(currentTable, page, previousSum)

    return {
      name: scrap.name,
      author,
      volumes: volumesScrapped,
    }
  }

  private getBooks(element): ScrapBookReturn[] {
    const books = element.map((child) => {
      const url = this.get(child, BOOKS_OBJECT_KEY.URL)
      const name = this.get(child, BOOKS_OBJECT_KEY.NAME)
      const publisher = this.get(child, BOOKS_OBJECT_KEY.PUBLISHER)
        ?.trimEnd()
        ?.replace('`', '')

      return {
        url,
        name,
        publisher,
      }
    })

    return this.findDuplicatedBookNamesAndFixIt(books)
  }

  private getPublishers(scrapped: ScrapBookReturn[]): ScrapPublisherReturn[] {
    return uniqBy(scrapped, (scrap) => scrap.publisher).map((scrap) => ({
      name: scrap.publisher,
    }))
  }

  private findDuplicatedBookNamesAndFixIt(books: ScrapBookReturn[]) {
    return books.reduce((currentArray, book) => {
      const dup = currentArray.filter((current) =>
        book.name.includes(current.name),
      )
      if (dup.length > 0) {
        currentArray.push({ ...book, dupIndex: dup.length })
        return currentArray
      }

      currentArray.push({ ...book, dupIndex: 0 })
      return currentArray
    }, [] as ScrapBookReturn[])
  }

  private getVolumeCover(page, currentIndex): string {
    const allCoversElements = this.scrapping.getByTag(
      page,
      TAG_KEY.GALERY_ITEM,
      null,
    )

    const element = [...allCoversElements][currentIndex]

    const coverUrl = this.get(element, BOOKS_OBJECT_KEY.COVER)

    return coverUrl
  }

  private getNumberOfVolumesInBrazil(table, page): number[] {
    return [...table].map(
      (tab, index, array) =>
        tab.children.map((vol, volIdx) => {
          return this.scrapping
            .getByTag(page, TAG_KEY.GALERY_ITEM, null)
            [
              (array[index - 1]?.children.length || 0) + volIdx
            ]?.parent.children?.filter((d) => d.type !== 'text').length
        })[0],
    )
  }

  private getAllTables(page) {
    return [
      ...this.scrapping
        .getElementByText(
          page,
          BOOKS_OBJECT_KEY.BRASIL as any,
          'table tbody' as any,
        )
        .map((_, tableEl) => ({
          children: tableEl?.children
            ?.filter((volume) => volume.data !== '\n')
            ?.filter((_, index) => index >= 1)
            ?.filter(
              (volume) => !!this.get(volume, BOOKS_OBJECT_KEY.VOL_PRICE),
            ),
        })),
    ].filter((table) => table.children.length !== 0)
  }

  private scrapVolumes(currentTable, page, sum) {
    const volumesScrapped = compact(
      currentTable.map((volume, index) => {
        const number = this.get(volume, BOOKS_OBJECT_KEY.VOL_NUMBER)
        const price = this.get(volume, BOOKS_OBJECT_KEY.VOL_PRICE)
        const releaseDate = this.get(
          volume,
          BOOKS_OBJECT_KEY.VOL_RELEASE_DATE_BR,
        )

        if (!price || !releaseDate || !price) return undefined

        const coverUrl = this.getVolumeCover(page, index + sum)

        if (!coverUrl) return undefined

        return {
          number,
          price,
          releaseDate,
          coverUrl,
        }
      }),
    ) as ScrapVolumeReturn[]

    return volumesScrapped
  }

  private get(object: JsonObject, key: BooksObjectKeyType): string {
    return isArray(key)
      ? compact(key.map((k) => get(object, k)))[0]
      : get(object, key)
  }
}
