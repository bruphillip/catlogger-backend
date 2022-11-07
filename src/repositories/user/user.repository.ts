import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { Crypto } from 'helpers/crypto'
import { PrismaService } from 'helpers/database/database.service'
import { jwtAdapter, UserProps } from 'helpers/jwt'
import { omit } from 'lodash'
import { UserSchemaBuildProps } from 'modules/user/user.schema'

@Injectable()
export class UserRepository {
  private cryto: Crypto
  constructor(private prismaService: PrismaService) {
    this.cryto = new Crypto()
  }

  async updatePassword(password: string) {
    return this.cryto.hash(password)
  }

  async comparePassword(password, crypted) {
    return this.cryto.compare(password, crypted)
  }

  sign(user: UserProps) {
    return jwtAdapter.sign(user)
  }

  omit<K extends keyof User>(user: User, field: K[]): Omit<User, K> {
    return omit(user, field)
  }

  private get userRepository() {
    return this.prismaService.user
  }

  findAll() {
    return this.userRepository.findMany()
  }

  getById(id: string) {
    return this.userRepository.findFirstOrThrow({
      where: { id },
      include: {
        volumes: true,
      },
    })
  }

  async toogleVolume(userId: string, volumeId: string) {
    const hasVolume = await this.userRepository.findFirst({
      where: { id: userId, volumes: { some: { bookVolumeId: volumeId } } },
    })

    if (hasVolume) {
      await this.userRepository.update({
        where: { id: userId },
        data: {
          volumes: {
            delete: {
              userId_bookVolumeId: {
                userId,
                bookVolumeId: volumeId,
              },
            },
          },
        },
      })
    } else {
      await this.userRepository.update({
        where: { id: userId },
        data: {
          volumes: {
            create: {
              bookVolumeId: volumeId,
            },
          },
        },
      })
    }

    return this.userRepository.findFirstOrThrow({
      where: {
        id: userId,
      },
      include: {
        volumes: {
          include: {
            book_volume: {
              select: {
                bookId: false,
                userVolumes: false,
                coverUrl: true,
                id: true,
                createdAt: true,
                isActive: true,
                number: true,
                price: true,
                updatedAt: true,
                releaseDate: true,
                book: {
                  select: {
                    author: true,
                    createdAt: true,
                    id: true,
                    isActive: true,
                    name: true,
                    updatedAt: true,
                    url: true,
                    publisher: true,
                  },
                },
              },
            },
          },
          orderBy: {
            book_volume: {
              number: 'asc',
            },
          },
        },
      },
    })
  }

  getByEmail(email: string) {
    return this.userRepository.findFirst({ where: { email } })
  }

  async create(user: UserSchemaBuildProps['create']) {
    return this.userRepository.create({
      data: {
        ...user,
        password: user.password,
      },
    })
  }

  async toogleLike(userId: string, bookId: string) {
    const user = await this.userRepository.findFirst({
      where: { id: userId, likes: { some: { id: bookId } } },
      select: {
        likes: true,
      },
    })

    if (!user)
      return this.userRepository.update({
        where: { id: userId },
        data: {
          likes: {
            connect: {
              id: bookId,
            },
          },
        },
        include: {
          likes: true,
        },
      })

    return this.userRepository.update({
      where: { id: userId },
      data: {
        likes: {
          disconnect: {
            id: bookId,
          },
        },
      },
      include: {
        likes: true,
      },
    })
  }
}
