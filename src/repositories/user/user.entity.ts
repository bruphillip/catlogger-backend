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

import { hash } from 'bcrypt'
import { BookVolume } from 'repositories/bookVolume/bookVolume.entity'

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
  volumes: BookVolume[]

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
    this.password = await hash(this.password, process.env.BCRYPT_SALT)
  }
}
