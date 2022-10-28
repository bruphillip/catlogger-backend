import { Book } from 'repositories/book/book.entity'
import { User } from 'repositories/user/user.entity'

export class BookVolume {
  id: string

  number: string

  price: string

  releaseDate: string

  coverUrl?: string

  users: User[]

  book: Book

  checked?: boolean

  isActive: boolean

  createdAt: Date

  updatedAt: Date
}
