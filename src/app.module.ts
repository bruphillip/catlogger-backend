import { Module } from '@nestjs/common'
import { UserModule } from 'modules/user/user.module'
import { DatabaseModule } from './helpers/database/database.module'
import { RepositoriesModule } from './repositories/repositories.module'

@Module({
  imports: [DatabaseModule, RepositoriesModule, UserModule],
})
export class AppModule {}
