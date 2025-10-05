import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LocalLoginBody {
  @ApiProperty()
  @IsEmail()
  email: string;
}
