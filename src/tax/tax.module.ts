import { Module } from '@nestjs/common';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';
import { TaxModel } from './tax.shcema';

@Module({
  imports:[TaxModel],
  controllers: [TaxController],
  providers: [TaxService],
})
export class TaxModule {}
