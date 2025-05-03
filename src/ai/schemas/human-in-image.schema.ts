import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

// Function Calling 방식
export interface HumanDetectionResult {
  isPersonInImage: boolean;
}

export const HumanDetectionFunctionCallingSchema = {
  name: 'detect_human',
  description: 'Detect if there is a human in the image',
  parameters: {
    type: 'object',
    properties: {
      isPersonInImage: {
        type: 'boolean',
        description: 'Whether a person is detected in the image',
      },
    },
    required: ['isPersonInImage'],
  },
};

export function HumanInImagePrompt(uri: string) {
  return ChatPromptTemplate.fromMessages([
    {
      role: 'system',
      content: 'You need to evaluate pictrue with given prompt',
    },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: uri },
        {
          type: 'text',
          text: 'Does this image contain a person wearing clothes?',
        },
      ],
    },
  ]);
}

// Structed Output 방식
export const HumanInImageSchema = z.object({
  isPersonInImage: z
    .boolean()
    .describe('Whether a person is detected in the image'),
});

export function HumanInImageStructuredPrompt(
  uri: string,
  formatInstruction: string,
) {
  const parser = StructuredOutputParser.fromZodSchema(HumanInImageSchema);
  const formatInstructions = parser.getFormatInstructions();
  console.log(formatInstructions);
  return ChatPromptTemplate.fromMessages([
    {
      role: 'system',
      content: `You are an AI that analyzes images to detect if a person is present.
Your task is to determine if there is a person wearing clothes in the image.

Response format:
{formatInstruction}
`,
    },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: uri },
        {
          type: 'text',
          text: 'Analyze this image and determine if there is a person wearing clothes in it.',
        },
      ],
    },
  ]);
}
