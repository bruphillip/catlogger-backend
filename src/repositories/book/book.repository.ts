import { Injectable } from '@nestjs/common'
import { PrismaService } from 'helpers/database/database.service'
import { differenceBy, sortBy } from 'lodash'
import { BookSchemaBuildProps } from 'modules/book/book.schema'

interface BookRepositoryProps {
  createMany: {
    url: string
    name: string
    publisherId: string
  }
  getByIdWithUserVolume: {
    bookId: string
    userId: string
  }
  update: {
    bookId?: string | null | undefined
    book: BookSchemaBuildProps['save']
  }
}

export type BookType = {
  url: string
  name: string
  publisherId: string
}

@Injectable()
export class BookRepository {
  constructor(private prismaService: PrismaService) {}

  private get bookRepository() {
    return this.prismaService.book
  }

  private get bookVolumeRepository() {
    return this.prismaService.bookVolume
  }

  async createMany(books: BookRepositoryProps['createMany'][]) {
    const createdBooks = await this.bookRepository.findMany({
      where: {
        name: {
          in: books.map((book) => book.name),
        },
      },
    })

    let toCreate = books

    if (createdBooks) {
      toCreate = differenceBy(books, createdBooks, 'name')
    }

    await this.bookRepository.createMany({
      skipDuplicates: true,
      data: toCreate,
    })

    return this.bookRepository.findMany()
  }

  async all(publisher?: string, sort?: 'asc' | 'desc') {
    return this.bookRepository.findMany({
      orderBy: {
        name: sort,
      },
      select: {
        author: true,
        createdAt: true,
        id: true,
        isActive: true,
        name: true,
        publisher: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            isActive: true,
            updatedAt: true,
          },
        },
        url: true,
        volumes: {
          select: {
            coverUrl: true,
            createdAt: true,
            id: true,
            isActive: true,
            number: true,
            price: true,
            releaseDate: true,
            updatedAt: true,
          },
          orderBy: {
            number: 'asc',
          },
          take: 1,
        },
      },
      where: publisher
        ? {
            volumes: {
              none: {
                id: undefined,
              },
            },
            publisher: {
              OR: [
                {
                  id: publisher,
                },
                {
                  name: publisher,
                },
              ],
            },
          }
        : {
            volumes: {
              some: {
                id: undefined,
              },
            },
          },
    })
  }

  getById(id: string) {
    return this.bookRepository.findUnique({
      where: { id },
      include: {
        publisher: true,
      },
    })
  }

  async getByIdWithUserVolume({
    bookId,
    userId,
  }: BookRepositoryProps['getByIdWithUserVolume']) {
    const usersVolume = (
      await this.bookVolumeRepository.findMany({
        where: {
          userVolumes: {
            some: {
              userId,
              book_volume: {
                bookId,
              },
            },
          },
        },
        orderBy: {
          number: 'asc',
        },
        include: {
          userVolumes: false,
        },
      })
    ).map((bookVolume) => ({ ...bookVolume, checked: true }))

    const bookWithVolumes = await this.bookRepository.findFirstOrThrow({
      where: {
        id: bookId,
      },
      select: {
        id: true,
        name: true,
        author: true,
        url: true,
        createdAt: true,
        isActive: true,
        publisher: true,
        updatedAt: true,
        liked: {
          where: {
            id: userId,
          },
          take: 1,
          distinct: 'id',
        },
        volumes: {
          where: {
            id: {
              notIn: usersVolume.map((user) => user.id),
            },
          },
        },
      },
    })

    return {
      ...bookWithVolumes,
      volumes: sortBy([...bookWithVolumes.volumes, ...usersVolume], 'number'),
    }
  }

  async search(search: string) {
    return this.bookRepository.findMany({
      where: {
        name: {
          contains: search,
        },
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        publisher: {
          select: {
            name: true,
            id: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        isActive: true,
        url: true,
        author: true,
        createdAt: true,
        updatedAt: true,
        volumes: {
          take: 1,
        },
      },
    })
  }

  async update({ bookId, book }: BookRepositoryProps['update']) {
    return this.bookRepository.upsert({
      where: {
        id: bookId || '',
      },
      include: {
        publisher: true,
        volumes: true,
      },
      create: {
        author: book.author,
        name: book.name,
        publisher: {
          connect: {
            id: book.publisher.id || '',
          },
        },
        url: book.url,
        volumes: {
          createMany: {
            data: book.volumes.map((volume) => ({
              coverUrl: volume.coverUrl,
              number: volume.number,
              releaseDate: volume.releaseDate,
              price: volume.price,
            })),
          },
        },
      },
      update: {
        author: book.author,
        name: book.name,
        publisher: {
          connect: {
            id: book.publisher.id || '',
          },
        },
        url: book.url,
        volumes: {
          deleteMany: book.volumes.map((volume) => ({
            NOT: { id: volume.id || '' },
          })),
          upsert: book.volumes.map((volume) => ({
            create: {
              coverUrl: volume.coverUrl,
              number: volume.number,
              releaseDate: volume.releaseDate,
              price: volume.price,
            },
            where: { id: volume?.id || '' },
            update: {
              coverUrl: volume.coverUrl,
              number: volume.number,
              releaseDate: volume.releaseDate,
              price: volume.price,
            },
          })),
        },
      },
    })
  }
}
