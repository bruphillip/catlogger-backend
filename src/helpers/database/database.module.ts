import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: Boolean(process.env.DB_LOGGING) || true,
      synchronize: Boolean(process.env.DB_SYNCRONIZE) || true,
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      uuidExtension: 'pgcrypto',
    }),
  ],
})
export class DatabaseModule {}
