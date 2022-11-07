import { NestFactory } from '@nestjs/core'
import env from 'constant/env'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  await app.listen(env.APP_PORT)
}
bootstrap()
