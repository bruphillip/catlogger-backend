import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
  exports: [ConfigModule],
})
export class EnvModule {}
