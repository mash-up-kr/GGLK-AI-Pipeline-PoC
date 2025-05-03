import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Function Calling 방식
export const FashionAnalysisFunctionCallingSchema = {
  name: 'ootd_fashion_analysis',
  description: 'Analyze the fashion in the image',
  parameters: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description: 'Description of the overall fashion style',
      },
      points: {
        type: 'number',
        description: 'Rating for aesthetics from 0-10',
      },
      balance: {
        type: 'number',
        description: 'Rating for outfit balance from 0-10',
      },
      sophistication: {
        type: 'number',
        description: 'Rating for sophistication level from 0-10',
      },
      sense: {
        type: 'number',
        description: 'Rating for fashion sense from 0-10',
      },
      hashtags: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'List of hashtags that describe the style',
      },
    },
    required: [
      'summary',
      'points',
      'balance',
      'sophistication',
      'sense',
      'hashtags',
    ],
  },
};

export function FashionAnalysisPrompt(uri: string) {
  return ChatPromptTemplate.fromMessages([
    {
      role: 'system',
      content: `You are a fashion analysis AI. Analyze the clothing style in the image and provide a structured evaluation. Be creative with the hashtags and make your analysis engaging and slightly humorous. 
Use Korean language for the summary and hashtags. AGAIN, YOU MUST USE KOREAN LANGUAGE FOR THE SUMMARY AND HASHTAGS.`,
    },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: uri },
        {
          type: 'text',
          text: 'Analyze the fashion style in this image.',
        },
      ],
    },
  ]);
}

// Structed output 방식
export const FashionAnalysisSchema = z.object({
  summary: z.string().describe('Description of the overall fashion style'),
  points: z.number().min(0).max(5).describe('Rating for aesthetics from 0-10'),
  balance: z
    .number()
    .min(0)
    .max(10)
    .describe('Rating for outfit balance from 0-10'),
  sophistication: z
    .number()
    .min(0)
    .max(10)
    .describe('Rating for sophistication level from 0-10'),
  sense: z
    .number()
    .min(0)
    .max(10)
    .describe('Rating for fashion sense from 0-10'),
  hashtags: z
    .array(z.string())
    .describe('List of hashtags that describe the style'),
});

export function FashionAnalysisStructuredPrompt(uri: string) {
  return ChatPromptTemplate.fromMessages([
    {
      role: 'system',
      content: `You are a fashion analysis AI. Your job is to analyze clothing styles in images.
Please evaluate the fashion style in the image and provide a detailed analysis.
YOU MUST USE KOREAN LANGUAGE FOR THE SUMMARY AND HASHTAGS AND ANSWER IN REALLY SHORT AS YOU CAN

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
          text: 'Analyze the fashion style in this image',
        },
      ],
    },
  ]);
}
