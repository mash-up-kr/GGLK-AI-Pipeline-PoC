import {
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { BasicEvaluationRequestDto } from './dto/basic-evaluation.dto';
import { MBtoByte } from './utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseInterceptors(FileInterceptor('image'))
  @Post('describe-function-calling')
  @ApiBody({
    type: BasicEvaluationRequestDto,
  })
  @ApiOperation({
    description: 'Basic image evaluation',
  })
  @ApiConsumes('multipart/form-data')
  public async doBasicEvaluationFunctionCalling(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MBtoByte(10) })],
        fileIsRequired: true,
      }),
    )
    image: Express.Multer.File,
  ) {
    return await this.appService.doBasicEvaluationFunctionCalling(image);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post('describe-structed-output')
  @ApiBody({
    type: BasicEvaluationRequestDto,
  })
  @ApiOperation({
    description: 'Basic image evaluation',
  })
  @ApiConsumes('multipart/form-data')
  public async doBasicEvaluationStructedOutput(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MBtoByte(10) })],
        fileIsRequired: true,
      }),
    )
    image: Express.Multer.File,
  ) {
    return await this.appService.doBasicEvaluationStructedOutput(image);
  }
}
