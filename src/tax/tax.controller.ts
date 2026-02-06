import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { TaxService } from './tax.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';

@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  //docs    Admin can create and update taxes
  //route   POST api/v1/tax
  //access  Private (admin)
  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createTaxDto: CreateTaxDto,
  ) {
    return this.taxService.create(createTaxDto);
  }

  //docs    Admin can get the taxes
  //route   GET api/v1/tax
  //access  Private (admin)

  @Get()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  getTaxes() {
    return this.taxService.get();
  }
  //docs    Admin can reset the taxes
  //route   DELETE api/v1/tax
  //access  Private (admin)
  @Delete()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  reSetTaxes() {
    return this.taxService.reSet();
  }
}
