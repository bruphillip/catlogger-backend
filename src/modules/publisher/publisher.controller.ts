import { Controller, Get } from '@nestjs/common'
import { PublisherRepository } from 'repositories/publisher/publisher.repository'

@Controller('publisher')
export class PublisherController {
  constructor(private publisherRepository: PublisherRepository) {}

  @Get('all')
  all() {
    return this.publisherRepository.all()
  }
}
