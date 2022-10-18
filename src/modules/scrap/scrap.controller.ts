import { Controller, Post } from '@nestjs/common'
import { JwtToken } from 'helpers/decorators/token.apply.decorator'

import { ScrapService } from './scrap.service'

@Controller('scrap')
export class ScrapController {
  constructor(private scrapService: ScrapService) {}

  @Post('bbm')
  @JwtToken()
  async bbm() {
    try {
      const scrappedTable = await this.scrapService.scrap()
      return scrappedTable
    } catch (err) {
      console.log(err)
    }
  }
}
