import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Crypto } from 'helpers/crypto'
import { set } from 'lodash'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()

    this.$use(async (params, next) => {
      if (params.model === 'User') {
        if (params.action === 'create') {
          const hashPassword = await new Crypto().hash(
            params.args.data.password,
          )
          set(params.args.data, 'password', hashPassword)
        }
      }

      return next(params)
    })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return
    const models = Reflect.ownKeys(this).filter(
      (key) => key[0] !== '_' && key !== '$extends',
    ) as string[]

    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()))
    // return Promise.all(
    //   models.map((modelKey) => this.$queryRawUnsafe(`TRUNCATE ${modelKey}`)),
    // )
  }
}
