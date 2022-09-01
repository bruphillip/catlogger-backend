import { Controller, Post } from '@nestjs/common'

import { ScrapService } from './scrap.service'

@Controller('scrap')
export class ScrapController {
  constructor(private scrapService: ScrapService) {}

  @Post('bbm')
  async bbm() {
    const scrappedTable = await this.scrapService.scrap()

    return scrappedTable
  }
}
