import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsRelations, In } from 'typeorm'
import { differenceBy } from 'lodash'

import { Book } from './book.entity'

export type BookType = {
  url: string
  name: string
  publisher: { id: string }
}

@Injectable()
export class BookRepository {
  constructor(private dataSource: DataSource) {}

  private get bookRepository() {
    return this.dataSource.getRepository(Book)
  }

  async createMany(books: BookType[]) {
    const createdBooks = await this.bookRepository.find({
      where: { name: In(books.map((book) => book.name)) },
    })

    let toCreate = books

    if (createdBooks) {
      toCreate = differenceBy(books, createdBooks, 'name')
    }

    const newBooks = await this.bookRepository.save(toCreate)

    return [...createdBooks, ...newBooks]
  }

  all(publisher: string) {
    return this.bookRepository.find({
      where: {
        publisher: publisher && [{ name: publisher }, { id: publisher }],
      },
      relations: { publisher: true, volumes: true },
    })
  }

  getById(id: string, relations?: FindOptionsRelations<Book>) {
    return this.bookRepository.findOne({
      where: { id },
      relations,
    })
  }
}
