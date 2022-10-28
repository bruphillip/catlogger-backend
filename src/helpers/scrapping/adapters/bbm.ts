import { Injectable } from '@nestjs/common'
import API from 'constant/api'
import { compact, get, isArray, tail, uniqBy } from 'lodash'
import { Queue } from 'helpers/queue'

import { Scrap, JsonObject } from '../scrap'
import { BOOKS_OBJECT_KEY } from 'constant/books.object.key'
import { TAG_KEY } from 'constant/tag.key'
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

    const { children } = this.scrapping.getByTag(loaded, TAG_KEY.TABLE_TBODY)

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

    const table = this.scrapping.getElementByText(
      page,
      BOOKS_OBJECT_KEY.VOL as any,
      'table tbody' as any,
    )[0]

    const volumesScrapped = compact(
      table.children
        .filter((volume) => volume.data !== '\n')
        .map((volume, index) => {
          const number = this.get(volume, BOOKS_OBJECT_KEY.VOL_NUMBER)
          const price = this.get(volume, BOOKS_OBJECT_KEY.VOL_PRICE)
          const releaseDate = this.get(
            volume,
            BOOKS_OBJECT_KEY.VOL_RELEASE_DATE_BR,
          )

          if (!price && !releaseDate) return undefined

          const coverUrl = this.getVolumeCover(page, index - 1)

          return {
            number,
            price,
            releaseDate,
            coverUrl,
          }
        }),
    ) as ScrapVolumeReturn[]

    return {
      name: scrap.name,
      author,
      volumes: tail(volumesScrapped),
    }
  }

  private getBooks(element): ScrapBookReturn[] {
    return element.map((child) => {
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
  }

  private getPublishers(scrapped: ScrapBookReturn[]): ScrapPublisherReturn[] {
    return uniqBy(scrapped, (scrap) => scrap.publisher).map((scrap) => ({
      name: scrap.publisher,
    }))
  }

  private getVolumeCover(page, volumeNumber: number): string {
    const element = this.scrapping.getByTag(
      page,
      TAG_KEY.FIGURE_IMG,
      volumeNumber,
    )

    const coverUrl = this.get(element, BOOKS_OBJECT_KEY.COVER)

    return coverUrl
  }

  private get(object: JsonObject, key: BooksObjectKeyType): string {
    return isArray(key)
      ? compact(key.map((k) => get(object, k)))[0]
      : get(object, key)
  }
}
