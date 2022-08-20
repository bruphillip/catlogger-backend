import { faker } from '@faker-js/faker'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'
import { User } from 'repositories/user/user.entity'
import { DataSource } from 'typeorm'

export class Generator {
  get faker() {
    return faker
  }

  get db() {
    return this.dataSource
  }

  get UserRepository() {
    return this.dataSource.getRepository(User)
  }

  constructor(private dataSource: DataSource) {}

  comparePassword(plainPassword: string, crytoPassword: string) {
    return compare(plainPassword, crytoPassword)
  }

  hashPassword(plainPassword: string) {
    return hash(plainPassword, Number(process.env.BCRYPT_SALT))
  }

  token(user: User) {
    new JwtService({ secret: process.env.JWT_SECRET }).sign({
      id: user.id,
      email: user.firstName,
    })
  }

  async createUser(user?: User) {
    const fullName = faker.name.fullName()

    return this.UserRepository.create({
      firstName: fullName,
      password: await this.hashPassword(fullName),
      ...user,
    })
  }
}
