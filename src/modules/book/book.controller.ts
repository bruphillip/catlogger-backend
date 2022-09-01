import { Controller, Get, Param, Query } from '@nestjs/common'
import { BookRepository } from 'repositories/book/book.repository'

@Controller('book')
export class BookController {
  constructor(private bookRepository: BookRepository) {}

  @Get('all')
  all(@Query('publisher') publisher?: string) {
    return this.bookRepository.all(publisher)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.bookRepository.getById(id)
  }

  @Get(':id/volumes')
  getVolumes(@Param('id') id: string) {
    return this.bookRepository.getById(id, { volumes: true, publisher: true })
  }
}
