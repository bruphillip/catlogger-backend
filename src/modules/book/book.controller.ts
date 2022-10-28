import { Controller, Get, Param, Query } from '@nestjs/common'
import { AuthUser, AuthUserProps } from 'helpers/decorators/auth.user.decorator'
import { JwtToken } from 'helpers/decorators/token.apply.decorator'
import { BookRepository } from 'repositories/book/book.repository'

@Controller('book')
@JwtToken()
export class BookController {
  constructor(private bookRepository: BookRepository) {}

  @Get('all')
  all(
    @Query('publisher') publisher?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    return this.bookRepository.all(publisher, sort)
  }

  @Get('id/:id')
  getById(@Param('id') id: string) {
    return this.bookRepository.getById(id)
  }

  @Get(':id/volumes')
  getVolumes(@AuthUser() user: AuthUserProps, @Param('id') id: string) {
    return this.bookRepository.getByIdWithUserVolume({
      bookId: id,
      userId: user.id,
    })
  }

  @Get('/search')
  search(@Query('search') search: string) {
    return this.bookRepository.search(search)
  }
}
