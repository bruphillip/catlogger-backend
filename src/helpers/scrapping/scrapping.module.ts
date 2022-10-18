import { Global, Module } from '@nestjs/common'
import { BBM } from './adapters/bbm'

@Global()
@Module({
  providers: [BBM],
  exports: [BBM],
})
export class ScrappingModule {}
