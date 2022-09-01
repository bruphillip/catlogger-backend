import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'

import { BookVolume } from 'repositories/bookVolume/bookVolume.entity'
import { Publisher } from 'repositories/publisher/publisher.entity'

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  url: string

  @Column({ nullable: true })
  author?: string

  @ManyToOne(() => Publisher, (publisher) => publisher.books, {
    nullable: false,
    cascade: true,
  })
  publisher: Publisher

  @OneToMany(() => BookVolume, (bookVolume) => bookVolume.book)
  volumes: BookVolume[]

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
