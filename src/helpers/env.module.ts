import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import env from 'constant/env'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${env.NODE_ENV}`,
    }),
  ],
  exports: [ConfigModule],
})
export class EnvModule {}
