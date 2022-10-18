import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm'

import { compare, hash } from 'bcrypt'
import { BookVolume } from 'repositories/bookVolume/bookVolume.entity'
import { jwtAdapter } from 'helpers/jwt'
import { omit } from 'lodash'
import env from 'constant/env'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  email: string

  @ManyToMany(() => BookVolume, (book) => book.users)
  @JoinTable({})
  volumes?: BookVolume[]

  @Column({ nullable: false })
  password: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  async updatePassword() {
    this.password = await hash(this.password, Number(env.BCRYPT_SALT))
  }

  async comparePassword(password) {
    return compare(password, this.password)
  }

  sign() {
    return jwtAdapter.sign(this)
  }

  omit(field: (keyof User)[]) {
    return omit(this, field)
  }
}
