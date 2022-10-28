import env from 'constant/env'
import { faker } from '@faker-js/faker'
import { JwtService } from '@nestjs/jwt'
import { formatTo } from 'helpers/date.format'
import { PrismaService } from 'helpers/database/database.service'
import { Prisma } from '@prisma/client'

interface GeneratorProps {
  user: {
    id: string
    name: string
    email: string
    password: string
    volumes: [{ bookVolumeId: string }]
  }
}

export class Generator {
  constructor(private prismaService: PrismaService) {}

  get faker() {
    return faker
  }

  get uuid() {
    return this.faker.datatype.uuid()
  }

  async clearAllRepositories() {
    await this.prismaService.cleanDatabase()
  }

  get UserRepository() {
    return this.prismaService.user
  }

  get PublisherRepository() {
    return this.prismaService.publisher
  }

  get BookRepository() {
    return this.prismaService.book
  }

  get VolumeRepository() {
    return this.prismaService.bookVolume
  }

  token(user: Partial<GeneratorProps['user']>) {
    new JwtService({ secret: env.JWT_SECRET }).sign({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  }

  mockUser(user?: Partial<GeneratorProps['user']>) {
    const fullName = this.faker.name.fullName()

    return {
      name: this.faker.name.fullName(),
      password: this.faker.internet.password(),
      email: this.faker.internet.email(fullName),
      ...user,
    }
  }

  async createUser(data?: Partial<GeneratorProps['user']>) {
    const mock = await this.mockUser(data)

    return this.UserRepository.create({
      data: mock,
    })
  }

  mockPublisher(publisher?: Partial<Prisma.PublisherUncheckedCreateInput>) {
    return {
      name: this.faker.company.name(),
      ...publisher,
    }
  }

  async createPublisher(data?: Partial<Prisma.PublisherUncheckedCreateInput>) {
    const mock = await this.mockPublisher(data)

    return this.PublisherRepository.create({
      data: mock,
    })
  }

  mockBook(book?: Partial<Prisma.BookUncheckedCreateInput>) {
    return {
      url: this.faker.internet.url(),
      name: this.faker.commerce.productName(),
      author: this.faker.name.fullName(),
      ...book,
    }
  }

  async createBook(
    publisherId: string,
    data?: Partial<Prisma.BookCreateInput>,
  ) {
    const mock = await this.mockBook({ ...data })

    return this.BookRepository.create({
      data: {
        ...mock,
        publisherId,
      },
    })
  }

  mockVolume(volume?: Partial<Prisma.BookVolumeUncheckedCreateInput>) {
    return {
      coverUrl: this.faker.image.cats(1234, 2345, true),
      number: `#${this.faker.random.numeric(1)}`,
      releaseDate: formatTo(this.faker.date.past()),
      price: this.faker.commerce.price(10, 99, 2, 'R$'),
      ...volume,
    }
  }

  async createVolume(
    bookId: string,
    data?: Partial<Prisma.BookVolumeUncheckedCreateInput>,
  ) {
    const mock = await this.mockVolume(data)

    return this.VolumeRepository.create({
      data: {
        ...mock,
        bookId,
      },
    })
  }

  async createUserBookVolume({
    userId,
    volumesId,
  }: {
    userId: string
    volumesId: string[]
  }) {
    return await this.UserRepository.update({
      where: { id: userId },
      data: {
        volumes: {
          createMany: {
            skipDuplicates: true,
            data: volumesId.map((volume) => ({
              bookVolumeId: volume,
            })),
          },
        },
      },
    })
  }
}
