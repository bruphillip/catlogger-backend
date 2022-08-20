import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm'

import { hash } from 'bcrypt'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: false })
  password: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  async updatePassword() {
    this.password = await hash(this.password, process.env.BCRYPT_SALT)
  }
}
