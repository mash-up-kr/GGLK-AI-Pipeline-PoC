import { ApiProperty } from '@nestjs/swagger';

export class BasicEvaluationRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  image: any;
}

export class BasicEvaluationResponseDto {}
