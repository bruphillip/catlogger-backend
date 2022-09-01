import { Global, Module } from '@nestjs/common'
import { BBM } from './adapters/bbm'

@Global()
@Module({
  imports: [BBM],
  providers: [BBM],
  exports: [BBM],
})
export class ScrappingModule {}
