import { Controller, Get, Query } from '@nestjs/common'
import { JwtToken } from 'helpers/decorators/token.apply.decorator'
import { PublisherRepository } from 'repositories/publisher/publisher.repository'

@Controller('publisher')
export class PublisherController {
  constructor(private publisherRepository: PublisherRepository) {}

  @Get('all')
  @JwtToken()
  all(@Query('query') query?: string) {
    return this.publisherRepository.all({ query })
  }
}
