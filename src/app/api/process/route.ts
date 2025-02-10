import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Validate API Key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API Key');
    }

    // Parse and validate request body
    const { content } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content provided' },
        { status: 400 }
      );
    }
    
    console.log('Processing content...');

    // Send request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert on creating educational content. Convert the provided notes into key points that will be used for memorization and typing practice. Focus on the terms that have definitions. Each term should be one short sentence. Each exercise serves the purpose of a flashcard, so there is a front and back and the sentence structure is simple. The term title (front) comes before the text (back), and is in the format of Front: Back. Each flashcard should be on a newline',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 1000,
    });

    // Check for expected response structure
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Return the processed content
    return NextResponse.json({
      success: true,
      responseText: response.choices[0].message.content,
      quizId: 'demo-' + Date.now()
    });

  } catch (error: any) {
    console.error('Error in /api/process:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process content'
      },
      { status: error.status || 500 }
    );
  }
}