import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseModule } from 'helpers/database/database.module'
import { PrismaService } from 'helpers/database/database.service'

import { Generator } from '../../../test/generator'
import { UserRepository } from './user.repository'

describe('User Service (unit)', () => {
  let userRepository: UserRepository
  let generator: Generator
  let module: TestingModule
  let dataSource: PrismaService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [UserRepository, DatabaseModule],
    }).compile()

    userRepository = module.get<UserRepository>(UserRepository)
    dataSource = module.get<PrismaService>(PrismaService)
    generator = new Generator(dataSource)
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  it('should create a user correctly', async () => {
    const user1 = generator.mockUser()
    const user2 = generator.mockUser()
    const user3 = generator.mockUser()

    dataSource.user.findMany = jest
      .fn()
      .mockReturnValueOnce([user1, user2, user3])

    const users = await userRepository.findAll()
    expect(users).toHaveLength(3)
    expect(users[0]).toBe(user1)
    expect(users[1]).toBe(user2)
    expect(users[2]).toBe(user3)
  })

  it('should find user by given id', async () => {
    const user1 = await generator.mockUser({
      id: generator.uuid,
    })

    dataSource.user.findFirstOrThrow = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.id).toBe(user1.id)
        return user1
      })

    const user = await userRepository.getById(user1?.id || '')
    expect(user).toBe(user1)
  })

  it('should add volume by given id', async () => {
    const user1 = generator.mockUser({
      id: generator.uuid,
      volumes: [{ bookVolumeId: generator.uuid }] as any,
    })

    const newVolume = { bookVolumeId: generator.uuid }

    dataSource.user.findFirst = jest.fn().mockImplementationOnce((params) => {
      expect(params.where.id).toBe(user1.id)
      expect(params.where.volumes.some.bookVolumeId).not.toBe(
        (user1.volumes as any)[0].bookVolumeId,
      )
      return undefined
    })

    dataSource.user.findFirstOrThrow = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.id).toBe(user1.id)
        return {
          ...user1,
          volumes: [
            { bookVolumeId: user1.volumes },
            { bookVolumeId: newVolume.bookVolumeId },
          ],
        }
      })

    dataSource.user.update = jest.fn().mockImplementationOnce((params) => {
      expect(params.where.id).toBe(user1.id)
      expect(params.data.volumes.create.bookVolumeId).toBe(
        newVolume.bookVolumeId,
      )
      return {
        ...user1,
        volumes: [
          { bookVolumeId: user1.volumes },
          { bookVolumeId: newVolume.bookVolumeId },
        ],
      }
    })

    const user = await userRepository.toogleVolume(
      user1.id as string,
      newVolume.bookVolumeId,
    )
    expect(user.id).toBe(user1.id)
    expect(user.volumes).toHaveLength(2)
  })

  it('should remove volume by given id', async () => {
    const user1 = await generator.mockUser({
      id: generator.uuid,
      volumes: [
        { bookVolumeId: generator.uuid },
        { bookVolumeId: generator.uuid },
      ] as any,
    })

    const volumeId = (user1.volumes as any)[1].bookVolumeId

    dataSource.user.findFirst = jest.fn().mockImplementationOnce((params) => {
      expect(params.where.id).toBe(user1.id)
      expect(params.where.volumes.some.bookVolumeId).toBe(volumeId)
      return [{ bookVolumeId: generator.uuid }]
    })

    dataSource.user.findFirstOrThrow = jest
      .fn()
      .mockImplementationOnce((params) => {
        expect(params.where.id).toBe(user1.id)
        return {
          ...user1,
          volumes: [{ bookVolumeId: (user1.volumes as any)[0].bookVolumeId }],
        }
      })

    dataSource.user.update = jest.fn().mockImplementationOnce((params) => {
      expect(params.where.id).toBe(user1.id)
      expect(params.data.volumes.delete.userId_bookVolumeId.bookVolumeId).toBe(
        volumeId,
      )
      return {
        ...user1,
        volumes: [{ bookVolumeId: (user1.volumes as any)[0].bookVolumeId }],
      }
    })
    const user = await userRepository.toogleVolume(user1.id as string, volumeId)
    expect(user.id).toBe(user1.id)
    expect(user.volumes).toHaveLength(1)
    expect((user.volumes as any)[0].bookVolumeId).toBe(
      (user1.volumes as any)[0].bookVolumeId,
    )
  })
})
