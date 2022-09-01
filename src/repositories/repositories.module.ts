import { Global, Module } from '@nestjs/common'
import { BookRepository } from './book/book.repository'
import { BookVolumeRepository } from './bookVolume/bookVolume.repository'
import { PublisherRepository } from './publisher/publisher.repository'
import { UserRepository } from './user/user.repository'

@Global()
@Module({
  exports: [
    UserRepository,
    PublisherRepository,
    BookRepository,
    BookVolumeRepository,
  ],
  providers: [
    UserRepository,
    PublisherRepository,
    BookRepository,
    BookVolumeRepository,
  ],
})
export class RepositoriesModule {}
