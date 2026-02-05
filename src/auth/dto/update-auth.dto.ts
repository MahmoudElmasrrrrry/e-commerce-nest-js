import { PartialType } from '@nestjs/mapped-types';
import { signUpDto,  } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(signUpDto) {}