import { Injectable } from '@nestjs/common'
import { DataSource, In } from 'typeorm'
import { differenceBy } from 'lodash'

import { BookVolume } from './bookVolume.entity'
import { Book } from 'repositories/book/book.entity'

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
  constructor(private dataSource: DataSource) {}

  private get bookVolumeRepository() {
    return this.dataSource.getRepository(BookVolume)
  }

  private get bookRepository() {
    return this.dataSource.getRepository(Book)
  }

  async createMany(bookVolumes: BookVolumesType[]) {
    return Promise.all(
      bookVolumes.map(async (volume) => {
        const book = await this.bookRepository.findOneBy({ name: volume.name })

        if (!book.author) {
          await this.bookRepository.update(
            { id: book.id },
            { author: volume.author },
          )
        }

        const createdVolumes = await this.bookVolumeRepository.find({
          where: {
            number: In(volume.volumes.map((vol) => vol.number)),
            book: { id: book.id },
          },
        })

        const volumeWithBookId = volume.volumes.map((volume) => ({
          ...volume,
          book: { id: book.id },
        }))

        let toCreate = volumeWithBookId

        if (createdVolumes) {
          toCreate = differenceBy(volumeWithBookId, createdVolumes, 'number')
        }

        let newVolumes = []

        if (toCreate.length !== 0) {
          newVolumes = await this.bookVolumeRepository.save(toCreate)
        }

        return [...createdVolumes, ...newVolumes]
      }),
    )
  }
}
