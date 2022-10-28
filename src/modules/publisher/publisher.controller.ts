import { Controller, Get, Query } from '@nestjs/common'
import { AuthUser, AuthUserProps } from 'helpers/decorators/auth.user.decorator'
import { JwtToken } from 'helpers/decorators/token.apply.decorator'
import { PublisherRepository } from 'repositories/publisher/publisher.repository'

@Controller('publisher')
@JwtToken()
export class PublisherController {
  constructor(private publisherRepository: PublisherRepository) {}

  @Get('all')
  all(@Query('query') query?: string) {
    return this.publisherRepository.all({ query })
  }

  @Get('myBooks')
  async myBook(@AuthUser() user: AuthUserProps) {
    return this.publisherRepository.userBooksVolumesOrderedByPublisher({
      userId: user.id,
    })
  }
}
