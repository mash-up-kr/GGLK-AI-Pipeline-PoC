import {
  RunnableBranch,
  RunnableLambda,
  RunnableSequence,
} from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredOutputParser } from 'langchain/output_parsers';
import * as sharp from 'sharp';
import {
  FashionAnalysisFunctionCallingSchema,
  FashionAnalysisPrompt,
  FashionAnalysisSchema,
  FashionAnalysisStructuredPrompt,
} from './schemas/fashion-analysis.schema';
import {
  HumanDetectionFunctionCallingSchema,
  HumanInImagePrompt,
  HumanInImageSchema,
  HumanInImageStructuredPrompt,
} from './schemas/human-in-image.schema';

interface HumanDetectionResult {
  isPersonInImage: boolean;
}

/**
 * Runnable Branch
 * https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.branch.RunnableBranch.html#runnablebranch
 *
 * 마지막 default는 주어진 조건들에 모두 해당 안될때이며, branches는 (조건, Runnable)형태로 주어줘야함
 *
 * Langchain.js LCEL RunnableSequence
 * https://js.langchain.com/docs/how_to/sequence/
 *
 * Structed Output
 * https://js.langchain.com/docs/how_to/structured_output
 * https://js.langchain.com/docs/concepts/structured_outputs
 *
 */

@Injectable()
export class AiService {
  private readonly chatModel: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    this.chatModel = new ChatOpenAI({
      apiKey: this.configService.get('OPEN_AI_TOKEN'),
      model: 'gpt-4o-mini',
      temperature: 0,
    });
  }

  /**
   *
   * 이미지 그냥 넣으면 MaxToken Exceed 문제가 발생
   * Base64 Encoding하는데 그 과정에서 이미지가 너무 큰 문제
   * 최대한 압축률 높에서 Max Token 문제 해결하면됨
   * 굳이 압축 lambda 배포 없이 런타임 압축해도될듯
   */
  private async compressImage(
    mimetype: string,
    imageBuffer: Buffer,
  ): Promise<string> {
    try {
      const compressedImageBuffer = await sharp(imageBuffer)
        .resize(800, null, { withoutEnlargement: true })
        .webp({ quality: 70 })
        .toBuffer();

      return `data:image/webp;base64,${compressedImageBuffer.toString('base64')}`;
    } catch (error) {
      return `data:${mimetype};base64,${imageBuffer.toString('base64')}`;
    }
  }

  // Function Calling 방식 구현
  public async doBasicEvaluationFunctionCalling(
    mimetype: string,
    imageBuffer: Buffer,
  ) {
    const uri = await this.compressImage(mimetype, imageBuffer);

    const humanDetectionModel = this.chatModel.bind({
      functions: [HumanDetectionFunctionCallingSchema],
      function_call: { name: 'detect_human' },
    });

    const fashionAnalysisModel = this.chatModel.bind({
      functions: [FashionAnalysisFunctionCallingSchema],
      function_call: { name: 'ootd_fashion_analysis' },
    });

    // Human Detection
    const checkHumanInImage = RunnableSequence.from([
      HumanInImagePrompt(uri),
      humanDetectionModel,
      (response) => {
        if (response.additional_kwargs.function_call) {
          return JSON.parse(response.additional_kwargs.function_call.arguments);
        }
        return { isPersonInImage: false };
      },
    ]);

    // Fashion Analysis
    const fashionAnalysisSequence = RunnableSequence.from([
      () => FashionAnalysisPrompt(uri),
      fashionAnalysisModel,
      (response) => {
        if (response.additional_kwargs.function_call) {
          return {
            success: true,
            message: JSON.parse(
              response.additional_kwargs.function_call.arguments,
            ),
          };
        }
        return {
          success: false,
          message: 'Failed to analyze fashion',
        };
      },
    ]);

    // Person Detection Chain Routing
    const processResult = RunnableBranch.from([
      [
        (output: HumanDetectionResult) => output.isPersonInImage === true,
        fashionAnalysisSequence,
      ],
      RunnableLambda.from(() => ({
        success: false,
        message: 'Fail to analysis',
      })),
    ]);

    try {
      const humanDetectionResult = await checkHumanInImage.invoke(uri);
      const finalResult = await processResult.invoke(humanDetectionResult);
      return finalResult;
    } catch (error) {
      return {
        success: false,
        message: `Error processing image: ${error.message}`,
      };
    }
  }

  // Structed Output 방식 구현
  public async doBasicEvaluationWithStructedOutput(
    mimetype: string,
    imageBuffer: Buffer,
  ) {
    const uri = await this.compressImage(mimetype, imageBuffer);

    const humanDetectionParser =
      StructuredOutputParser.fromZodSchema(HumanInImageSchema);
    const fashionAnalysisParser = StructuredOutputParser.fromZodSchema(
      FashionAnalysisSchema,
    );

    // Human Detection
    const checkHumanInImage = RunnableSequence.from([
      RunnableLambda.from(() =>
        HumanInImageStructuredPrompt(uri).formatMessages({
          // Langchain.js에서는 .format을 하면 무조건 String으로 반환됨. 만약 Message 배열을 전달하고 싶은 경우에는 무조건 formatMessages를 사용해야함
          // 만약 .format을 사용하면 String으로만 반환되게 때문에 이점 주의
          // https://v03.api.js.langchain.com/classes/_langchain_core.prompts.FewShotChatMessagePromptTemplate.html?_gl=1*1ibpxe8*_ga*MTQ4NjcyNDY0Mi4xNzQ2MjgzNjY5*_ga_47WX3HKKY2*czE3NDYzNzg1OTIkbzkkZzEkdDE3NDYzODE4NzUkajAkbDAkaDA.#format
          // https://v03.api.js.langchain.com/classes/_langchain_core.prompts.FewShotChatMessagePromptTemplate.html#formatMessages
          formatInstruction: humanDetectionParser.getFormatInstructions(),
        }),
      ),
      this.chatModel,
      humanDetectionParser,
    ]);

    // Fashion Analysis
    const fashionAnalysisSequence = RunnableSequence.from([
      RunnableLambda.from(() =>
        FashionAnalysisStructuredPrompt(uri).formatMessages({
          formatInstruction: fashionAnalysisParser.getFormatInstructions(),
        }),
      ),
      this.chatModel,
      fashionAnalysisParser,
    ]);

    const humanDetectionResult = await checkHumanInImage.invoke({});
    if (!humanDetectionResult.isPersonInImage) {
      return {
        success: false,
        message: 'No person detected in the image',
      };
    } else {
      return {
        success: true,
        message: await fashionAnalysisSequence.invoke({}),
      };
    }
  }
}
