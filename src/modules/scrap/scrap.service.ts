import { Injectable } from '@nestjs/common'

import { BBM } from 'helpers/scrapping/adapters/bbm'
import { ScrapBookReturn } from 'helpers/scrapping/adapters/bbm.types'
import { find } from 'lodash'
import { BookRepository, BookType } from 'repositories/book/book.repository'
import { BookVolumeRepository } from 'repositories/bookVolume/bookVolume.repository'
import {
  PublisherRepository,
  PublisherType,
} from 'repositories/publisher/publisher.repository'

@Injectable()
export class ScrapService {
  constructor(
    private bbmService: BBM,
    private publisherRepository: PublisherRepository,
    private bookRepository: BookRepository,
    private bookVolumeRepository: BookVolumeRepository,
  ) {}

  async scrap() {
    const scrap = await this.bbmService.scrapBooks()

    const publishers = await this.publisherRepository.createMany(
      scrap.publishers,
    )
    const booksWithPublisherId = this.mapBookPublisherNameToId(
      scrap.books,
      publishers,
    )

    const books = await this.bookRepository.createMany(booksWithPublisherId)

    const volumesScrap = await this.bbmService.getBooksVolume(scrap.books)

    const volumes = await this.bookVolumeRepository.createMany(volumesScrap)

    return { publishers, books, volumes }
  }

  private mapBookPublisherNameToId(
    books: ScrapBookReturn[],
    publishers: PublisherType[],
  ) {
    return books.map<BookType>((book) => ({
      name: book.name,
      url: book.url,
      publisher: find(
        publishers,
        (publisher) => publisher.name === book.publisher,
      ),
    }))
  }
}
