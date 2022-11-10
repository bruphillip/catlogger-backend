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
        bookVolumes.map(async (book) => {
          const bookFound = await this.bookRepository.findFirstOrThrow({
            where: { name: book.name },
          })

          if (!bookFound?.author) {
            await this.bookRepository.update({
              where: {
                id: bookFound.id,
              },
              data: {
                author: book?.author,
              },
            })
          }

          const createdVolumes = await this.bookVolumeRepository.findMany({
            where: {
              number: {
                in: book.volumes.map((vol) => vol.number),
              },
              bookId: bookFound.id,
            },
            select: {
              bookId: true,
              coverUrl: true,
              id: true,
              number: true,
              price: true,
            },
          })

          const volumeWithBookId = book.volumes.map((volume) => ({
            ...volume,
            bookId: bookFound.id,
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
            where: { bookId: bookFound.id },
          })
        }),
      )
    } catch (err) {}
  }
}
