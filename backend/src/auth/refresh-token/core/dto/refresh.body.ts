import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshBody {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
