export class Book {
  id: string
  name: string
  url: string
  author?: string
  publisher: string[] // Publisher
  volumes: string[] // BookVolume[]
  firstVolume: string //BookVolume
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
