import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { DataSource } from 'typeorm'
import { Generator } from './generator'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let db: DataSource
  let generator: Generator

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    db = moduleFixture.get<DataSource>(DataSource)
    app = moduleFixture.createNestApplication()

    generator = new Generator(db)
    await app.init()
  })

  it('/ (GET)', async () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
  })
})
