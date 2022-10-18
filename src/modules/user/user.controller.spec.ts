import { Test, TestingModule } from '@nestjs/testing'
import env from 'constant/env'
import { DatabaseModule } from 'helpers/database/database.module'
import { jwtAdapter } from 'helpers/jwt'
import { User } from 'repositories/user/user.entity'
import { UserRepository } from 'repositories/user/user.repository'
import { DataSource } from 'typeorm'
import { Generator } from '../../../test/generator'
import { UserController } from './user.controller'

describe('UserController', () => {
  let controller: UserController
  let dataSource: DataSource
  let generator: Generator

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [UserRepository],
      controllers: [UserController],
    }).compile()

    dataSource = module.get<DataSource>(DataSource)
    generator = new Generator(dataSource)

    controller = module.get<UserController>(UserController)
  })

  afterEach(async () => {
    await generator.clearAllRepositories([User])
  })

  afterAll(async () => {
    await generator.clearAllRepositories()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return /me information', async () => {
    const user = await generator.createUser()

    const result = (await controller.me(user)) as Partial<User>

    expect(result.id).toBe(user.id)
    expect(result.createdAt.toDateString()).toBe(user.createdAt.toDateString())
    expect(result.email).toBe(user.email)
  })

  it('should login and give return token', async () => {
    const user = await generator.createUser({ password: '12345' })

    const result = (await controller.login({
      ...user,
      password: '12345',
    })) as Partial<User & { token: string }>

    expect(result.id).toBe(user.id)
    expect(result.createdAt.toDateString()).toBe(user.createdAt.toDateString())
    expect(result.email).toBe(user.email)
    expect(result.token).toBeDefined()

    const decodedToken = await jwtAdapter.decode(
      `${env.TOKEN_PREFIX} ${result.token}`,
    )
    expect(decodedToken).toEqual(
      expect.objectContaining({
        name: user.name,
        email: user.email,
        id: user.id,
      }),
    )
  })

  it('should create a new user', async () => {
    const rawUser = await generator.mockUser()

    const result = (await controller.create(rawUser)) as Partial<User>

    const created = await generator.UserRepository.findOneBy({ id: result.id })

    expect(created.email).toBe(rawUser.email)
    expect(created.name).toBe(rawUser.name)
  })

  it('should getById an user', async () => {
    const user = await generator.createUser()

    const result = (await controller.getById(user.id)) as Partial<User>

    expect(result.email).toBe(user.email)
    expect(result.name).toBe(user.name)
    expect(result.id).toBe(user.id)
  })

  it('should add a new volume to user', async () => {
    const user = await generator.createUser()
    const publisher = await generator.createPublisher()
    const book = await generator.createBook(publisher.id)
    const volume = await generator.createVolume(book.id, { number: '#1' })

    const result = (await controller.toogleVolumes(
      user,
      volume.id,
    )) as Partial<User>

    expect(result.volumes).toHaveLength(1)
    expect(result.name).toBe(user.name)
    expect(result.id).toBe(user.id)
    expect(result.volumes[0].book.id).toBe(book.id)
    expect(result.volumes[0].book.publisher.id).toBe(publisher.id)
  })

  it('should add a new one into user volumes', async () => {
    const user = await generator.createUser()
    const publisher = await generator.createPublisher()
    const book = await generator.createBook(publisher.id)
    const volume1 = await generator.createVolume(book.id, { number: '#1' })
    const volume2 = await generator.createVolume(book.id, { number: '#2' })
    const volume3 = await generator.createVolume(book.id, { number: '#3' })
    await generator.createUserBookVolume({
      userId: user.id,
      volumesId: [volume2.id, volume1.id],
    })

    const result = (await controller.toogleVolumes(
      user,
      volume3.id,
    )) as Partial<User>

    expect(result.volumes).toHaveLength(3)
    expect(result.name).toBe(user.name)
    expect(result.id).toBe(user.id)
    expect(result.volumes[0].book.id).toBe(book.id)
    expect(result.volumes[0].book.publisher.id).toBe(publisher.id)

    expect(result.volumes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: volume1.id, number: volume1.number }),
        expect.objectContaining({ id: volume3.id, number: volume3.number }),
        expect.objectContaining({ id: volume2.id, number: volume2.number }),
      ]),
    )
  })

  it.only('should remove into user volumes', async () => {
    const user = await generator.createUser()
    const publisher = await generator.createPublisher()
    const book = await generator.createBook(publisher.id)
    const volume1 = await generator.createVolume(book.id, { number: '#1' })
    const volume2 = await generator.createVolume(book.id, { number: '#2' })
    const volume3 = await generator.createVolume(book.id, { number: '#3' })
    await generator.createUserBookVolume({
      userId: user.id,
      volumesId: [volume2.id, volume1.id, volume3.id],
    })

    const result = (await controller.toogleVolumes(
      user,
      volume1.id,
    )) as Partial<User>

    expect(result.volumes).toHaveLength(2)
    expect(result.name).toBe(user.name)
    expect(result.id).toBe(user.id)
    expect(result.volumes[0].book.id).toBe(book.id)
    expect(result.volumes[0].book.publisher.id).toBe(publisher.id)

    expect(result.volumes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: volume3.id, number: volume3.number }),
        expect.objectContaining({ id: volume2.id, number: volume2.number }),
      ]),
    )
  })
})
