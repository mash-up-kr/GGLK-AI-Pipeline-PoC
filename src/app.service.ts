import { Injectable } from '@nestjs/common';
import { AiService } from './ai/ai.service';

@Injectable()
export class AppService {
  constructor(private readonly aiService: AiService) {}

  public async doBasicEvaluationFunctionCalling(image: Express.Multer.File) {
    const result = await this.aiService.doBasicEvaluationFunctionCalling(
      image.mimetype,
      image.buffer,
    );
    return result;
  }

  public async doBasicEvaluationStructedOutput(image: Express.Multer.File) {
    const result = await this.aiService.doBasicEvaluationWithStructedOutput(
      image.mimetype,
      image.buffer,
    );
    return result;
  }
}
