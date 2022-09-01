import { Injectable } from '@nestjs/common'
import API from 'constant/api'
import { get, tail, uniqBy } from 'lodash'
import { Queue } from 'helpers/queue'

import { Scrap, JsonObject } from '../scrap'

const BOOKS_OBJECT_KEY = {
  URL: 'children[0].children[0].attribs.href',
  NAME: 'children[0].children[0].children[0].data',
  PUBLISHER: 'children[1].children[0].data',
  AUTHOR: 'children[9].data',
  VOL_NUMBER: 'children[1].children[0].data',
  VOL_RELEASE_DATE: 'children[3].children[0].data',
  VOL_PRICE: 'children[7].children[0].data',
} as const

const TAG_KEY = {
  TABLE_TBODY: 'table tbody',
  PRIMARY_ARTICLE_DIV_P: '#primary article div p',
}

type BooksObjectKeyType = typeof BOOKS_OBJECT_KEY[keyof typeof BOOKS_OBJECT_KEY]

export type ScrapBookReturn = {
  url: string
  name: string
  publisher: string
}

export type ScrapPublisherReturn = {
  name: string
}

export type ScrapVolumeReturn = {
  number: string
  price: string
  releaseDate: string
}

export type ScrapVolumeAuthorReturn = {
  name: string
  author: string
  volumes: ScrapVolumeReturn[]
}

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
      .map((volume) => {
        const number = this.get(volume, BOOKS_OBJECT_KEY.VOL_NUMBER)
        const price = this.get(volume, BOOKS_OBJECT_KEY.VOL_PRICE)
        const releaseDate = this.get(volume, BOOKS_OBJECT_KEY.VOL_RELEASE_DATE)

        return {
          number,
          price,
          releaseDate,
        }
      })

    return {
      name: scrap.name,
      author,
      volumes: tail(volumesScrapped),
    }
  }

  getPublishers(scrapped: ScrapBookReturn[]): ScrapPublisherReturn[] {
    return uniqBy(scrapped, (scrap) => scrap.publisher).map((scrap) => ({
      name: scrap.publisher,
    }))
  }

  get(object: JsonObject, key: BooksObjectKeyType): string {
    return get(object, key)
  }
}
