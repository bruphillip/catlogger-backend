import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import { AuthUser, AuthUserProps } from 'helpers/decorators/auth.user.decorator'
import { JwtToken } from 'helpers/decorators/token.apply.decorator'
import { assign } from 'lodash'
import { BookRepository } from 'repositories/book/book.repository'
import { PublisherRepository } from 'repositories/publisher/publisher.repository'

import { BookSchema, BookSchemaBuildProps } from './book.schema'

@Controller('book')
@JwtToken()
export class BookController {
  constructor(
    private bookRepository: BookRepository,
    private publisherRepository: PublisherRepository,
  ) {}

  @Get('all')
  all(
    @Query('publisher') publisher?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    return this.bookRepository.all(publisher, sort)
  }

  @Get('id/:id')
  getById(@Param('id') id: string) {
    return this.bookRepository.getById(id)
  }

  @Get(':id/volumes')
  getVolumes(@AuthUser() user: AuthUserProps, @Param('id') id: string) {
    return this.bookRepository.getByIdWithUserVolume({
      bookId: id,
      userId: user.id,
    })
  }

  @Get('/search')
  search(@Query('search') search: string) {
    return this.bookRepository.search(search)
  }

  @Post('')
  async save(@BookSchema('save') book: BookSchemaBuildProps['save']) {
    const foundPublisher = await this.publisherRepository.findByName({
      name: book.publisher.name,
    })

    if (!foundPublisher) {
      const newPublisher = await this.publisherRepository.create({
        name: book.publisher.name,
      })
      assign(book, { publisher: newPublisher })
    } else {
      assign(book, { publisher: foundPublisher })
    }

    const updated = await this.bookRepository.update({ bookId: book.id, book })

    return updated
  }
}
