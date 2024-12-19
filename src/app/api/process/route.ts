import OpenAI from 'openai';
import { NextResponse } from 'next/server';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});




// async function listModels() {
//   try {
//     const models = await openai.models.list();
//     console.log(models);
//   } catch (error) {
//     console.error('Error listing models:', error);
//   }
// }

// listModels();

export async function POST(req: Request) {
  try {
    // Validate API Key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OpenAI API Key');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const { content } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content provided' },
        { status: 400 }
      );
    }

    // Send request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at creating educational content. Convert the provided notes into a structured quiz format with key points that will be used for typing practice. Focus on the most important concepts.',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 1000,
    });

    // Log OpenAI response
    console.log('OpenAI Response:', response);

    // Check for expected response structure
    if (!response.choices || !response.choices[0]?.message?.content) {
      throw new Error('Unexpected OpenAI response format');
    }

    // Simulate saving to a database
    const quizId = 'demo-' + Date.now();

    return NextResponse.json({
      quizId,
      content: response.choices[0].message.content,
    });
  } catch (error: any) {
    console.error('Error in /api/process:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process content' },
      { status: 500 }
    );
  }
}
