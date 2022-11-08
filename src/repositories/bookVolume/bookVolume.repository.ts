import { Injectable } from '@nestjs/common'
import { PrismaService } from 'helpers/database/database.service'
import { differenceBy } from 'lodash'

export type BookVolumesType = {
  name: string
  author: string
  volumes: BookVolumeType[]
}

export type BookVolumeType = {
  number: string
  price: string
  releaseDate: string
  book?: { id: string }
}

@Injectable()
export class BookVolumeRepository {
  constructor(private prismaService: PrismaService) {}

  private get bookVolumeRepository() {
    return this.prismaService.bookVolume
  }

  private get bookRepository() {
    return this.prismaService.book
  }

  async createMany(bookVolumes: BookVolumesType[]) {
    try {
      return Promise.all(
        bookVolumes.map(async (volume) => {
          const book = await this.bookRepository.findFirstOrThrow({
            where: { name: volume?.name },
          })

          if (!book?.author) {
            await this.bookRepository.update({
              where: {
                id: book.id,
              },
              data: {
                author: volume?.author,
              },
            })
          }

          const createdVolumes = await this.bookVolumeRepository.findMany({
            where: {
              number: {
                in: volume.volumes.map((vol) => vol.number),
              },
              bookId: book.id,
            },
            select: {
              bookId: true,
              coverUrl: true,
              id: true,
              number: true,
              price: true,
            },
          })

          const volumeWithBookId = volume.volumes.map((volume) => ({
            ...volume,
            bookId: book.id,
          }))

          let toCreate = volumeWithBookId

          if (createdVolumes) {
            toCreate = differenceBy(volumeWithBookId, createdVolumes, 'number')
          }

          if (toCreate.length !== 0) {
            await this.bookVolumeRepository.createMany({
              skipDuplicates: true,
              data: toCreate,
            })
          }

          return this.bookVolumeRepository.findMany({
            where: { bookId: book.id },
          })
        }),
      )
    } catch (err) {
    } finally {
    }
  }
}
