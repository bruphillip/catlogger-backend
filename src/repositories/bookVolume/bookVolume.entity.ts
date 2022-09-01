import { Book } from 'repositories/book/book.entity'
import { User } from 'repositories/user/user.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'

@Entity()
export class BookVolume {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  number: string

  @Column({ nullable: true })
  price: string

  @Column({ nullable: true })
  releaseDate: string

  @Column({ nullable: true })
  coverUrl?: string

  @JoinTable()
  users: User[]

  @ManyToOne(() => Book, (book) => book.volumes, {
    nullable: false,
    cascade: true,
  })
  book: Book

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
