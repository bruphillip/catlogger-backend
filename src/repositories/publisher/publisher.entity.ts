import { Book } from 'repositories/book/book.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm'

@Entity()
export class Publisher {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @OneToMany(() => Book, (book) => book.publisher)
  books: Book[]

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
