import env from 'constant/env'
import { faker } from '@faker-js/faker'
import { JwtService } from '@nestjs/jwt'
import { formatTo } from 'helpers/date.format'
import { Book } from 'repositories/book/book.entity'
import { BookVolume } from 'repositories/bookVolume/bookVolume.entity'
import { Publisher } from 'repositories/publisher/publisher.entity'
import { User } from 'repositories/user/user.entity'
import { DataSource, EntityTarget, Entity } from 'typeorm'

export class Generator {
  get faker() {
    return faker
  }

  get uuid() {
    return this.faker.datatype.uuid()
  }

  get db() {
    return this.dataSource
  }

  async clearAllRepositories(only?: EntityTarget<typeof Entity>[]) {
    if (!only || only.length === 0)
      await Promise.all([
        this.BookRepository.delete,
        this.UserRepository.delete,
        this.PublisherRepository.delete,
        this.VolumeRepository.delete,
      ])
    else
      await Promise.all(
        only.map((instance) => this.dataSource.getRepository(instance).delete),
      )
  }

  get UserRepository() {
    return this.dataSource.getRepository(User)
  }

  get PublisherRepository() {
    return this.dataSource.getRepository(Publisher)
  }

  get BookRepository() {
    return this.dataSource.getRepository(Book)
  }

  get VolumeRepository() {
    return this.dataSource.getRepository(BookVolume)
  }

  constructor(private dataSource: DataSource) {}

  token(user: Partial<User>) {
    new JwtService({ secret: env.JWT_SECRET }).sign({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  }

  mockUser(user?: Partial<User>) {
    const fullName = this.faker.name.fullName()

    return {
      name: this.faker.name.fullName(),
      password: this.faker.internet.password(),
      email: this.faker.internet.email(fullName),
      ...user,
    }
  }

  mockPublisher(publisher?: Partial<Publisher>): Partial<Publisher> {
    return {
      name: this.faker.company.name(),
      ...publisher,
    }
  }

  mockBook(book?: Partial<Book>): Partial<Book> {
    return {
      url: this.faker.internet.url(),
      name: this.faker.commerce.productName(),
      author: this.faker.name.fullName(),
      ...book,
    }
  }

  mockVolume(volume?: Partial<BookVolume>): Partial<BookVolume> {
    return {
      coverUrl: this.faker.image.cats(1234, 2345, true),
      number: `#${this.faker.random.numeric(1)}`,
      releaseDate: formatTo(this.faker.date.past()),
      price: this.faker.commerce.price(10, 99, 2, 'R$'),
      ...volume,
    }
  }

  async createUser(data?: Partial<User>) {
    const mock = await this.mockUser()

    const created = await this.UserRepository.create({
      ...mock,
      ...data,
    })

    return this.UserRepository.save(created)
  }

  async createPublisher(data?: Partial<Publisher>) {
    const mock = await this.mockPublisher()

    const created = await this.PublisherRepository.create({
      ...mock,
      ...data,
    })

    return this.PublisherRepository.save(created)
  }

  async createBook(publisherId: string, data?: Partial<Book>) {
    const mock = await this.mockBook()

    const created = await this.BookRepository.create({
      ...mock,
      ...data,
      publisher: {
        id: publisherId,
      },
    })

    return this.BookRepository.save(created)
  }

  async createVolume(bookId: string, data?: Partial<BookVolume>) {
    const mock = await this.mockVolume()

    const created = await this.VolumeRepository.create({
      ...mock,
      ...data,
      book: {
        id: bookId,
      },
    })

    return this.VolumeRepository.save(created)
  }

  async createUserBookVolume({
    userId,
    volumesId,
  }: {
    userId: string
    volumesId: string[]
  }) {
    const created = await this.UserRepository.create({
      id: userId,
      volumes: volumesId.map((id) => ({ id })),
    })

    return this.UserRepository.save(created)
  }
}
