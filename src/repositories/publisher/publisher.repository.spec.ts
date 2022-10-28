import { Test, TestingModule } from '@nestjs/testing'
import { PublisherRepository } from './publisher.repository'
import { Generator } from '../../../test/generator'
import { DatabaseModule } from 'helpers/database/database.module'
import { PrismaService } from 'helpers/database/database.service'

describe('Publisher Repository (unit)', () => {
  let publisherRepository: PublisherRepository
  let generator: Generator
  let module: TestingModule
  let dataSource: PrismaService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [PublisherRepository, DatabaseModule],
    }).compile()

    publisherRepository = module.get<PublisherRepository>(PublisherRepository)
    dataSource = module.get<PrismaService>(PrismaService)
    generator = new Generator(dataSource)
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  it('should create many publishers', async () => {
    const publisher1 = generator.mockPublisher()
    const publisher2 = generator.mockPublisher()
    const publisher3 = generator.mockPublisher()
    const publisher4 = generator.mockPublisher()

    dataSource.publisher.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.name.in).toHaveLength(4)

        return []
      })
      .mockImplementationOnce((params) => {
        expect(params).not.toBeDefined()

        return [publisher1, publisher2, publisher3, publisher4]
      })
    dataSource.publisher.createMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.data).toHaveLength(4)
        expect(params.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining(publisher1),
            expect.objectContaining(publisher2),
            expect.objectContaining(publisher3),
            expect.objectContaining(publisher4),
          ]),
        )
      })

    const result = await publisherRepository.createMany([
      publisher1,
      publisher2,
      publisher3,
      publisher4,
    ])

    expect(result).toHaveLength(4)
  })

  it('should create only the not created publishers', async () => {
    const publisher1 = generator.mockPublisher()
    const publisher2 = generator.mockPublisher()
    const publisher3 = generator.mockPublisher()
    const publisher4 = generator.mockPublisher()

    dataSource.publisher.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.name.in).toHaveLength(4)

        return [publisher1, publisher2]
      })
      .mockImplementationOnce((params) => {
        expect(params).not.toBeDefined()

        return [publisher1, publisher2, publisher3, publisher4]
      })
    dataSource.publisher.createMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.data).toHaveLength(2)
        expect(params.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining(publisher3),
            expect.objectContaining(publisher4),
          ]),
        )
      })

    const result = await publisherRepository.createMany([
      publisher1,
      publisher2,
      publisher3,
      publisher4,
    ])

    expect(result).toHaveLength(4)
  })

  it('should return all publishers', async () => {
    const publisher1 = generator.mockPublisher()
    const publisher2 = generator.mockPublisher()
    const publisher3 = generator.mockPublisher()
    const publisher4 = generator.mockPublisher()

    dataSource.publisher.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.OR[0].name.contains).toBeUndefined()

        return [publisher1, publisher2, publisher3, publisher4]
      })

    const result = await publisherRepository.all({})

    expect(result).toHaveLength(4)
  })

  it('should return publishers filtering by Id', async () => {
    const publisher2 = generator.mockPublisher({ id: generator.uuid })

    dataSource.publisher.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.OR[1].id).toBe(publisher2.id)

        return [publisher2]
      })

    const result = await publisherRepository.all({ query: publisher2.id })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(publisher2.id)
  })

  it('should return publishers filtering by name', async () => {
    const publisher2 = generator.mockPublisher({
      id: generator.uuid,
      name: 'Teste',
    })
    const publisher1 = generator.mockPublisher({
      id: generator.uuid,
      name: 'Teste',
    })

    dataSource.publisher.findMany = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.OR[0].name.contains).toBe('Teste')

        return [publisher2, publisher1]
      })

    const result = await publisherRepository.all({ query: publisher2.name })

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(publisher2.id)
    expect(result[1].id).toBe(publisher1.id)
  })
})
