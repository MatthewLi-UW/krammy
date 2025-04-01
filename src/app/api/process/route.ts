import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import exampleText from './exampleText';
import exampleCards from './exampleCards';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add retrying logic for rate limit errors
async function callOpenAIWithRetry(content: string, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in educational content creation. Convert the provided notes into concise, easy-to-memorize flashcards. Focus on key terms and their definitions, ensuring each term has a clear and simple explanation. Each flashcard is displayed in the format: Front: Back (where "Front" is the term and "Back" is its definition). Keep definitions brief, using clear and simple sentence structures. Ensure every important concept from the text is covered. Do not include any special text effects such as bold or italics.',
          }, 
          {
            role: 'user',
            content: 
              `Here is an example of the input and expected output:
      
              **Example Input:**
              ${exampleText}
      
              **Example Output:**
              ${exampleCards}
      
              Now, convert the following text into flashcards:
              ${content.substring(0, Math.min(content.length, 4000))}`  // Limit content length
          }
        ]
      });
      return response;
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limit hit - exponential backoff
        attempt++;
        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`Rate limit hit. Retrying in ${delayMs/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          throw new Error('OpenAI rate limit exceeded. Please try again later.');
        }
      } else {
        throw error; // Re-throw non-rate-limit errors
      }
    }
  }
  
  throw new Error('Maximum retry attempts reached');
}

export async function POST(req: Request) {
  try {
    // Validate API Key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API Key');
    }

    // Parse and validate request body
    const { content, deckName, detailLevel } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content provided' },
        { status: 400 }
      );
    }

    // Limit content length to prevent oversize requests
    const trimmedContent = content.substring(0, Math.min(content.length, 8000));
    console.log(`Processing content (${trimmedContent.length} chars)...`);

    // Send request to OpenAI with retry logic
    const response = await callOpenAIWithRetry(trimmedContent);

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