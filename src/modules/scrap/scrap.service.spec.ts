import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseModule } from 'helpers/database/database.module'
import { PrismaService } from 'helpers/database/database.service'
import { Queue } from 'helpers/queue'
import { BBM } from 'helpers/scrapping/adapters/bbm'
import {
  ScrapBookReturn,
  ScrapPublisherReturn,
  ScrapVolumeReturn,
} from 'helpers/scrapping/adapters/bbm.types'
import { range, runInContext } from 'lodash'
import { BookRepository } from 'repositories/book/book.repository'
import { BookVolumeRepository } from 'repositories/bookVolume/bookVolume.repository'
import { PublisherRepository } from 'repositories/publisher/publisher.repository'

import { Generator } from '../../../test/generator'
import { ScrapService } from './scrap.service'

jest.mock('../../constant/blacklist', () => ({
  __esModule: true,
  default: { TESTE: { publisher: 'Publisher Demo', name: 'Book Demo' } },
}))

describe('Scrap Service', () => {
  let service: ScrapService
  let dataSource: PrismaService
  let generator: Generator
  let bbm: BBM

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        ScrapService,
        BBM,
        PublisherRepository,
        BookRepository,
        BookVolumeRepository,
      ],
    }).compile()

    dataSource = module.get<PrismaService>(PrismaService)
    bbm = module.get<BBM>(BBM)
    service = module.get<ScrapService>(ScrapService)
    generator = new Generator(dataSource)

    await generator?.clearAllRepositories()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should link publishers with books', async () => {
    const publisher1 = await generator.createPublisher()
    const publisher2 = await generator.createPublisher()
    const publisher3 = await generator.createPublisher()

    const scrappedBooks = [
      {
        name: generator.productName,
        publisher: publisher1.name,
        url: generator.url,
      },
      {
        name: generator.productName,
        publisher: publisher1.name,
        url: generator.url,
      },
      {
        name: generator.productName,
        publisher: publisher2.name,
        url: generator.url,
      },
      {
        name: generator.productName,
        publisher: publisher3.name,
        url: generator.url,
      },
    ] as ScrapBookReturn[]

    const linked = service['mapBookPublisherNameToId'](scrappedBooks, [
      publisher1,
      publisher3,
      publisher2,
    ])

    expect(linked).toHaveLength(4)
    expect(linked[0].publisherId).toBe(publisher1.id)
    expect(linked[1].publisherId).toBe(publisher1.id)
    expect(linked[2].publisherId).toBe(publisher2.id)
    expect(linked[3].publisherId).toBe(publisher3.id)
  })

  it('should scrap books and volumes', async () => {
    const scrappedPublisher = [
      {
        name: 'Panini',
      },
      {
        name: 'JBC',
      },
      {
        name: 'NewPOP',
      },
    ] as ScrapPublisherReturn[]

    const scrappedBooks = [
      {
        name: generator.productName,
        publisher: scrappedPublisher[0].name,
        url: generator.url,
      },
      {
        name: generator.productName,
        publisher: scrappedPublisher[0].name,
        url: generator.url,
      },
      {
        name: generator.productName,
        publisher: scrappedPublisher[1].name,
        url: generator.url,
      },
      {
        name: generator.productName,
        publisher: scrappedPublisher[2].name,
        url: generator.url,
      },
    ] as ScrapBookReturn[]

    bbm.scrapBooks = jest.fn().mockReturnValueOnce({
      publishers: scrappedPublisher,
      books: scrappedBooks,
    })

    const scrapQueue = jest.fn().mockImplementation((scrap) => {
      const lo = runInContext()
      return {
        name: scrap.name,
        author: generator.name,
        volumes: [
          {
            coverUrl: generator.url,
            number: lo.uniqueId('# '),
            price: range(10, 30, 2).toString(),
            releaseDate: 'random date',
          },
          {
            coverUrl: generator.url,
            number: lo.uniqueId('# '),
            price: range(10, 30, 2).toString(),
            releaseDate: 'random date',
          },
          {
            coverUrl: generator.url,
            number: lo.uniqueId('# '),
            price: range(10, 30, 2).toString(),
            releaseDate: 'random date',
          },
        ] as ScrapVolumeReturn[],
      }
    })

    bbm['queue'] = new Queue(scrapQueue)

    const result = await service.scrap()

    expect(result).toBeDefined()
    expect(result.volumes).toHaveLength(4)
    expect(result.volumes?.[0]).toHaveLength(3)
    expect(result.books).toHaveLength(4)
    expect(result.publishers).toHaveLength(3)
  })

  it('should blacklisted some books and publishers', async () => {
    const publisher1 = await generator.createPublisher({
      name: 'Publisher Demo',
    })
    const publisher2 = await generator.createPublisher()

    const books = await Promise.all([
      await generator.createBook(publisher1.id, {
        name: 'Book Demo',
      }),
      await generator.createBook(publisher1.id),
      await generator.createBook(publisher2.id),
      await generator.createBook(publisher2.id),
    ])

    const blacklisted = service['blacklistBooks'](books, [
      publisher1,
      publisher2,
    ])

    expect(blacklisted).toBeDefined()
    expect(blacklisted).toHaveLength(3)
    expect(blacklisted[0]).toBe(books[1])
    expect(blacklisted[1]).toBe(books[2])
    expect(blacklisted[2]).toBe(books[3])
  })
})
