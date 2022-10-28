import { Test, TestingModule } from '@nestjs/testing'
import { BookRepository } from './book.repository'
import { Generator } from '../../../test/generator'
import { DatabaseModule } from 'helpers/database/database.module'
import { PrismaService } from 'helpers/database/database.service'

describe('Book Repository (unit)', () => {
  let bookRepository: BookRepository
  let generator: Generator
  let module: TestingModule
  let dataSource: PrismaService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [BookRepository, DatabaseModule],
    }).compile()

    bookRepository = module.get<BookRepository>(BookRepository)
    dataSource = module.get<PrismaService>(PrismaService)
    generator = new Generator(dataSource)
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  it('should create many books', async () => {
    const publisher = generator.mockPublisher()
    const book1 = generator.mockBook({ publisherId: publisher.id }) as any
    const book2 = generator.mockBook({ publisherId: publisher.id }) as any
    const book3 = generator.mockBook({ publisherId: publisher.id }) as any
    const book4 = generator.mockBook({ publisherId: publisher.id }) as any

    dataSource.book.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.name.in).toHaveLength(4)

        return []
      })
      .mockImplementationOnce((params) => {
        expect(params).not.toBeDefined()

        return [book1, book2, book3, book4]
      })
    dataSource.book.createMany = jest.fn().mockImplementationOnce((params) => {
      expect(params.data).toHaveLength(4)
      expect(params.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining(book1),
          expect.objectContaining(book2),
          expect.objectContaining(book3),
          expect.objectContaining(book4),
        ]),
      )
    })

    const result = await bookRepository.createMany([book1, book2, book3, book4])

    expect(result).toHaveLength(4)
  })

  it('should create many books and merge with ones that already exists', async () => {
    const publisher = generator.mockPublisher()
    const book1 = generator.mockBook({ publisherId: publisher.id }) as any
    const book2 = generator.mockBook({ publisherId: publisher.id }) as any
    const book3 = generator.mockBook({ publisherId: publisher.id }) as any
    const book4 = generator.mockBook({ publisherId: publisher.id }) as any

    dataSource.book.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.name.in).toHaveLength(2)

        return [book3, book4]
      })
      .mockImplementationOnce((params) => {
        expect(params).not.toBeDefined()

        return [book1, book2, book3, book4]
      })
    dataSource.book.createMany = jest.fn().mockImplementationOnce((params) => {
      expect(params.data).toHaveLength(2)
      expect(params.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining(book1),
          expect.objectContaining(book2),
        ]),
      )
    })

    const result = await bookRepository.createMany([book1, book2])

    expect(result).toHaveLength(4)
  })

  it('should find all books', async () => {
    const publisher = generator.mockPublisher()
    const book1 = generator.mockBook({ publisherId: publisher.id }) as any
    const book2 = generator.mockBook({ publisherId: publisher.id }) as any
    const book3 = generator.mockBook({ publisherId: publisher.id }) as any
    const book4 = generator.mockBook({ publisherId: publisher.id }) as any

    dataSource.book.findMany = jest.fn().mockImplementationOnce(() => {
      return [book1, book2, book3, book4]
    })

    const result = await bookRepository.all()

    expect(result).toHaveLength(4)
  })

  it('should find all books and filter by publisher', async () => {
    const publisher = generator.mockPublisher({ id: generator.uuid })
    const book1 = generator.mockBook({ publisherId: publisher.id }) as any
    const book2 = generator.mockBook({ publisherId: publisher.id }) as any

    dataSource.book.findMany = jest.fn().mockImplementationOnce((params) => {
      expect(params.where.publisher.OR[0].id).toBe(publisher.id)
      return [book1, book2]
    })

    const result = await bookRepository.all(publisher.id)

    expect(result).toHaveLength(2)
  })

  it('should get book by id', async () => {
    const publisher = generator.mockPublisher({ id: generator.uuid })
    const book1 = generator.mockBook({ publisherId: publisher.id }) as any

    dataSource.book.findUnique = jest.fn().mockImplementationOnce((params) => {
      expect(params.where.id).toBe(book1.id)
      return book1
    })

    const result = await bookRepository.getById(book1.id)

    expect(result).toBe(book1)
  })

  it('should get book by id and relate with user volumes', async () => {
    const user = generator.mockUser({ id: generator.uuid })
    const publisher = generator.mockPublisher({ id: generator.uuid })
    const book = generator.mockBook({
      publisherId: publisher.id,
      id: generator.uuid,
    })
    const volume1 = generator.mockVolume({
      bookId: book.id,
      number: '1',
      id: generator.uuid,
    })
    const volume2 = generator.mockVolume({
      bookId: book.id,
      number: '2',
      id: generator.uuid,
    })

    dataSource.bookVolume.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.userVolumes.some.userId).toBe(user.id)
        expect(params.where.userVolumes.some.book_volume.bookId).toBe(book.id)
        return [volume1]
      })

    dataSource.book.findFirstOrThrow = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.id).toBe(book.id)
        expect(params.select.volumes.where.id.notIn).toStrictEqual([volume1.id])
        return { ...book, volumes: [volume2] }
      })

    const result = await bookRepository.getByIdWithUserVolume({
      bookId: book.id as string,
      userId: user.id as string,
    })

    expect(result.volumes).toHaveLength(2)
    expect(result.volumes[0].number).toBe('1')
    expect((result.volumes[0] as any).checked).toBe(true)

    expect(result.volumes[1].number).toBe('2')
  })

  it('should search for book', async () => {
    const publisher = generator.mockPublisher({ id: generator.uuid })
    const book1 = generator.mockBook({ publisherId: publisher.id }) as any

    dataSource.book.findMany = jest.fn().mockImplementationOnce((params) => {
      expect(params.where.name.contains).toBe('search')
      return [book1]
    })

    const result = await bookRepository.search('search')

    expect(result).toStrictEqual([book1])
    expect(result).toHaveLength(1)
  })
})
