import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { SuppliersModel } from './suppliers.schema';

@Module({
  imports: [SuppliersModel],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
