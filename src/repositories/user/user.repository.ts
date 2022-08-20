import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UserRepository {
  constructor(private dataSource: DataSource) {}

  private get userRepository() {
    return this.dataSource.getRepository(User)
  }

  findAll() {
    return this.userRepository.find()
  }
}
