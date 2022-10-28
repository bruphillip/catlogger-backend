import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseModule } from 'helpers/database/database.module'
import { BookRepository } from 'repositories/book/book.repository'
import { BookController } from './book.controller'

describe('BookController', () => {
  let controller: BookController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [BookRepository],
      controllers: [BookController],
    }).compile()

    controller = module.get<BookController>(BookController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  // it('should get all books', async () => {})
})
