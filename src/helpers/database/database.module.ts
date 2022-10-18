import { Global, Module } from '@nestjs/common'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import env from 'constant/env'
import { createDatabase } from 'typeorm-extension'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const opts: TypeOrmModuleOptions = {
          type: 'postgres',
          host: 'localhost',
          port: Number(env.DB_PORT) || 5432,
          username: env.DB_USERNAME,
          password: env.DB_PASSWORD,
          database: env.DB_NAME,
          logging: env.DB_LOGGING,
          synchronize: env.DB_SYNCRONIZE,
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          uuidExtension: 'pgcrypto',
        }

        try {
          await createDatabase({
            ifNotExist: true,
            options: {
              type: opts.type,
              database: opts.database,
              username: opts.username,
              password: opts.password,
              port: opts.port,
              uuidExtension: 'pgcrypto',
              entities: opts.entities,
            },
          })
        } catch (err) {}

        return opts
      },
    }),
  ],
})
export class DatabaseModule {}
