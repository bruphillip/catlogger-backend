import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseModule } from 'helpers/database/database.module'
import { PrismaService } from 'helpers/database/database.service'
import { PublisherRepository } from 'repositories/publisher/publisher.repository'

import { Generator } from '../../../test/generator'
import { PublisherController } from './publisher.controller'

describe('PublisherController', () => {
  let controller: PublisherController
  let dataSource: PrismaService
  let generator: Generator

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [PublisherRepository],
      controllers: [PublisherController],
    }).compile()

    controller = module.get<PublisherController>(PublisherController)
    dataSource = module.get<PrismaService>(PrismaService)

    generator = new Generator(dataSource)

    jest.restoreAllMocks()
    await generator?.clearAllRepositories()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should get all publishers', async () => {
    const publisher1 = await generator.createPublisher()
    const publisher2 = await generator.createPublisher()
    const publisher3 = await generator.createPublisher()
    const publisher4 = await generator.createPublisher()

    const result = await controller.all()

    expect(result).toHaveLength(4)
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(publisher1),
        expect.objectContaining(publisher2),
        expect.objectContaining(publisher3),
        expect.objectContaining(publisher4),
      ]),
    )
  })

  it('should get all publishers matching with query', async () => {
    const publisher1 = await generator.createPublisher({ name: 'Panini' })
    await generator.createPublisher()
    await generator.createPublisher()
    await generator.createPublisher()

    const result = await controller.all('Panini')

    expect(result).toHaveLength(1)
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(publisher1)]),
    )
  })

  it('should get all publishers matching with id', async () => {
    const publisher1 = await generator.createPublisher()
    await generator.createPublisher()
    await generator.createPublisher()
    await generator.createPublisher()

    const result = await controller.all(publisher1.id)

    expect(result).toHaveLength(1)
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(publisher1)]),
    )
  })
})
