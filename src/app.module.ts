import { Module } from '@nestjs/common'
import { ScrappingModule } from 'helpers/scrapping/scrapping.module'
import { ScrapModule } from 'modules/scrap/scrap.module'
import { UserModule } from 'modules/user/user.module'
import { DatabaseModule } from './helpers/database/database.module'
import { RepositoriesModule } from './repositories/repositories.module'
import { PublisherModule } from './modules/publisher/publisher.module'
import { BookModule } from './modules/book/book.module'

@Module({
  imports: [
    DatabaseModule,
    RepositoriesModule,
    ScrappingModule,
    UserModule,
    ScrapModule,
    PublisherModule,
    BookModule,
  ],
})
export class AppModule {}
