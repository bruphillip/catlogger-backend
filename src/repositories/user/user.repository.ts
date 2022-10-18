import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { xorBy } from 'lodash'

import { User } from './user.entity'
import { BookVolume } from 'repositories/bookVolume/bookVolume.entity'

@Injectable()
export class UserRepository {
  constructor(private dataSource: DataSource) {}

  private get userRepository() {
    return this.dataSource.getRepository(User)
  }

  findAll() {
    return this.userRepository.find()
  }

  getById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: { volumes: true },
    })
  }

  async toogleVolume(userId: string, volumeId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { volumes: true },
    })

    const volumes = xorBy(
      user.volumes || [],
      [{ id: volumeId }] as BookVolume[],
      'id',
    )

    const newUser = this.userRepository.create({
      volumes,
      id: userId,
    })

    await this.userRepository.save(newUser, { reload: true })

    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['volumes', 'volumes.book', 'volumes.book.publisher'],
      order: {
        volumes: {
          number: 'ASC',
        },
      },
    })
  }

  getByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } })
  }

  async create(user: Partial<User>) {
    const createdUser = await this.userRepository.create(user)

    return this.userRepository.save(createdUser)
  }
}
