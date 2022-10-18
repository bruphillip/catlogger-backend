import { Test, TestingModule } from '@nestjs/testing'
import { UserRepository } from './user.repository'
import { Generator } from '../../../test/generator'
import { DataSource } from 'typeorm'
import { DatabaseModule } from 'helpers/database/database.module'

describe('AppController (e2e)', () => {
  let userRepository: UserRepository
  let generator: Generator
  let module: TestingModule
  let dataSource: DataSource

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [UserRepository],
    }).compile()

    userRepository = module.get<UserRepository>(UserRepository)
    dataSource = module.get<DataSource>(DataSource)
    generator = new Generator(dataSource)
  })

  afterEach(async () => {
    // await dataSource.getRepository(User).createQueryBuilder().delete()
    jest.restoreAllMocks()
  })

  it('should create a user correctly', async () => {
    const userMock = await generator.mockUser()

    const getRepository = jest
      .spyOn(dataSource, 'getRepository')
      .mockReturnValue({
        find: () => Promise.resolve([userMock]),
      } as any)

    const users = await userRepository.findAll()
    expect(users).toHaveLength(1)
    expect(users[0]).toBe(userMock)

    getRepository.mockRestore()
  })

  it('should find user by given id', async () => {
    const user1 = await generator.mockUser({
      id: generator.uuid,
    })
    const getRepository = jest
      .spyOn(dataSource, 'getRepository')
      .mockReturnValue({
        findOne: ({ where }) => {
          expect(where.id).toBe(user1.id)
          return Promise.resolve(user1)
        },
      } as any)

    const user = await userRepository.getById(user1.id)
    expect(user).toBe(user1)

    getRepository.mockRestore()
  })

  it('should add volume by given id', async () => {
    const user1 = await generator.mockUser({
      id: generator.uuid,
      volumes: [{ id: generator.uuid } as any],
    })

    const newVolume = { id: generator.uuid }

    const getRepository = jest
      .spyOn(dataSource, 'getRepository')
      .mockImplementationOnce(
        () =>
          ({
            findOne: ({ where }) => {
              expect(where.id).toBe(user1.id)
              return Promise.resolve(user1)
            },
          } as any),
      )
      .mockReturnValue({
        findOne: ({ where }) => {
          expect(where.id).toBe(user1.id)
          return Promise.resolve({
            ...user1,
            volumes: [...user1.volumes, newVolume],
          })
        },
        create: ({ id, volumes }) => {
          expect(id).toBe(user1.id)
          expect(volumes).toHaveLength(2)
          expect(volumes).toEqual(expect.arrayContaining([newVolume]))

          return { ...user1, volumes }
        },
        save: jest.fn(),
      } as any)

    const user = await userRepository.toogleVolume(user1.id, newVolume.id)
    expect(user.id).toBe(user1.id)
    expect(user.volumes).toHaveLength(2)

    getRepository.mockRestore()
  })

  it.only('should remove volume by given id', async () => {
    const user1 = await generator.mockUser({
      id: generator.uuid,
      volumes: [{ id: generator.uuid }, { id: generator.uuid } as any],
    })

    const volumeId = user1.volumes[1].id

    const getRepository = jest
      .spyOn(dataSource, 'getRepository')
      .mockImplementationOnce(
        () =>
          ({
            findOne: ({ where }) => {
              expect(where.id).toBe(user1.id)
              return Promise.resolve(user1)
            },
          } as any),
      )
      .mockReturnValue({
        findOne: ({ where }) => {
          expect(where.id).toBe(user1.id)
          return Promise.resolve({
            ...user1,
            volumes: [user1.volumes[0]],
          })
        },
        create: ({ id, volumes }) => {
          expect(id).toBe(user1.id)
          expect(volumes).toHaveLength(1)

          return { ...user1, volumes }
        },
        save: jest.fn(),
      } as any)

    const user = await userRepository.toogleVolume(user1.id, volumeId)
    expect(user.id).toBe(user1.id)
    expect(user.volumes).toHaveLength(1)

    getRepository.mockRestore()
  })
})
