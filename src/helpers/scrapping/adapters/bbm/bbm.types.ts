import { BOOKS_OBJECT_KEY } from 'constant/books.object.key'

export type BooksObjectKeyType =
  typeof BOOKS_OBJECT_KEY[keyof typeof BOOKS_OBJECT_KEY]

export type ScrapBookReturn = {
  url: string
  name: string
  publisher: string
  dupIndex?: number
}

export type ScrapPublisherReturn = {
  name: string
}

export type ScrapVolumeReturn = {
  number: string
  price: string
  releaseDate: string
  coverUrl: string
}

export type ScrapVolumeAuthorReturn = {
  name: string
  author: string
  volumes: ScrapVolumeReturn[]
}
