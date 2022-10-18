import { Injectable } from '@nestjs/common'
import API from 'constant/api'
import { get, tail, uniqBy } from 'lodash'
import { Queue } from 'helpers/queue'

import { Scrap, JsonObject } from '../scrap'
import { BOOKS_OBJECT_KEY } from 'constant/books.object.key'
import { TAG_KEY } from 'constant/tag.key'
import {
  ScrapBookReturn,
  ScrapVolumeAuthorReturn,
  BooksObjectKeyType,
  ScrapPublisherReturn,
} from './bbm.types'
import { Cluster } from 'helpers/cluster/cluster'

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

    const { children } = loaded.getByTag(TAG_KEY.TABLE_TBODY).json()

    const books = children.map((child) => {
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
    const element = page.getByTag(TAG_KEY.PRIMARY_ARTICLE_DIV_P).json()
    const author = this.get(element, BOOKS_OBJECT_KEY.AUTHOR)
      ?.replace(':', '')
      ?.trimStart()

    const elementVolumes = page.getByTag(TAG_KEY.TABLE_TBODY).json()

    const volumesScrapped = elementVolumes.children
      .filter((volume) => volume.tag || volume.data !== '\n')
      .map((volume, index) => {
        const number = this.get(volume, BOOKS_OBJECT_KEY.VOL_NUMBER)
        const price = this.get(volume, BOOKS_OBJECT_KEY.VOL_PRICE)
        const releaseDate = this.get(volume, BOOKS_OBJECT_KEY.VOL_RELEASE_DATE)

        const coverUrl = this.getVolumeCover(page, String(index - 1))

        return {
          number,
          price,
          releaseDate,
          coverUrl,
        }
      })

    return {
      name: scrap.name,
      author,
      volumes: tail(volumesScrapped),
    }
  }

  private getPublishers(scrapped: ScrapBookReturn[]): ScrapPublisherReturn[] {
    return uniqBy(scrapped, (scrap) => scrap.publisher).map((scrap) => ({
      name: scrap.publisher,
    }))
  }

  private getVolumeCover(page, volumeNumber: string): string {
    const element = page.getByTag(TAG_KEY.GALLERY_1).json()
    const coverUrl = this.get(
      element,
      BOOKS_OBJECT_KEY.COVER.replace('idx', volumeNumber) as any,
    )

    return coverUrl
  }

  private get(object: JsonObject, key: BooksObjectKeyType): string {
    return get(object, key)
  }
}
