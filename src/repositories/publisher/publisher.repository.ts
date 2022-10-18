import { Injectable } from '@nestjs/common'
import { DataSource, In, Like } from 'typeorm'
import { differenceBy } from 'lodash'

import { Publisher } from './publisher.entity'

export type PublisherType = {
  id: string
  name: string
}

@Injectable()
export class PublisherRepository {
  constructor(private dataSource: DataSource) {}

  private get publisherRepository() {
    return this.dataSource.getRepository(Publisher)
  }

  async createMany(publishers: { name: string }[]) {
    const createdPublishers = await this.publisherRepository.find({
      where: { name: In(publishers.map((publisher) => publisher.name)) },
    })

    let toCreate = publishers

    if (createdPublishers) {
      toCreate = differenceBy(publishers, createdPublishers, 'name')
    }

    const newPublishers = await this.publisherRepository.save(toCreate)

    return [...createdPublishers, ...newPublishers]
  }

  all({ query }: { query: string }) {
    return this.publisherRepository.find({
      where: query && [
        { name: Like(`%${query}%`) },
        { id: Like(`%${query}%`) },
      ],

      relations: { books: true },
    })
  }
}
