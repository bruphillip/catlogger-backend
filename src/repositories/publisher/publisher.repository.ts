import { Injectable } from '@nestjs/common'
import { differenceBy } from 'lodash'

import { PrismaService } from 'helpers/database/database.service'

interface PublisherRepositoryProps {
  userBooksVolumesOrderedByPublisher: { userId: string }
}

export type PublisherType = {
  id: string
  name: string
}

@Injectable()
export class PublisherRepository {
  constructor(private prismaService: PrismaService) {}

  private get publisherRepository() {
    return this.prismaService.publisher
  }

  async createMany(publishers: { name: string }[]) {
    const createdPublishers = await this.publisherRepository.findMany({
      where: {
        name: {
          in: publishers.map((publisher) => publisher.name),
        },
      },
    })

    let toCreate = publishers

    if (createdPublishers) {
      toCreate = differenceBy(publishers, createdPublishers, 'name')
    }

    await this.publisherRepository.createMany({
      skipDuplicates: true,
      data: toCreate,
    })

    return this.publisherRepository.findMany()
  }

  all({ query }: { query?: string }) {
    return this.publisherRepository.findMany({
      where: query
        ? {
            OR: [
              {
                name: {
                  mode: 'insensitive',
                  contains: query,
                },
              },
              {
                id: query,
              },
            ],
          }
        : {},
      include: {
        books: true,
      },
    })
  }

  async userBooksVolumesOrderedByPublisher({
    userId,
  }: PublisherRepositoryProps['userBooksVolumesOrderedByPublisher']) {
    const publishers = await this.publisherRepository.findMany({
      orderBy: {
        name: 'asc',
      },
      where: {
        books: {
          some: {
            volumes: {
              some: {
                userVolumes: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        books: {
          where: {
            volumes: {
              some: {
                userVolumes: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
          select: {
            author: true,
            id: true,
            name: true,
            url: true,
            volumes: {
              where: {
                userVolumes: {
                  every: {
                    userId,
                  },
                },
              },
              orderBy: {
                number: 'asc',
              },
              select: {
                _count: true,
                id: true,
                number: true,
                price: true,
                coverUrl: true,
                releaseDate: true,
              },
            },
          },
        },
      },
    })

    return publishers.map((publisher) => ({
      ...publisher,
      books: publisher.books.map((book) => ({
        ...book,
        volumes: book.volumes.map((volume) => ({
          ...volume,
          checked: volume._count.userVolumes !== 0,
          _count: undefined,
        })),
      })),
    }))
  }
}
