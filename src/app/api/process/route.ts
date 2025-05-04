import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import exampleText from './exampleText';
import exampleCards from './exampleCards';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Update the function signature to accept detailLevel
async function callOpenAIWithRetry(content: string, detailLevel: number, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      // Get detail level description
      const detailDescription = detailLevel === 1 
        ? "Create minimalist flashcards with only the essential information. Keep definitions extremely concise."
        : detailLevel === 2 
        ? "Create balanced flashcards with moderate detail. Include definitions with supporting context where necessary."
        : "Create comprehensive flashcards with thorough explanations.";
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              `You are an expert in educational content creation. Convert the provided notes into ${detailLevel === 1 ? 'concise' : detailLevel === 2 ? 'balanced' : 'comprehensive'}, easy-to-memorize flashcards.
              
              Detail level: ${detailLevel}/3 - ${detailDescription}
              
              Focus on key terms and their definitions, ensuring each term has a clear explanation in ideally one sentence. 
              
              Follow this format exactly:
              Front: Term or concept
              Back: Definition or explanation

              Ensure every important concept from the text is covered. Do not include any special text effects such as bold, italics, or asterisks.
              Be sure to create different content from any examples. Focus exclusively on the user's input content.
              If there is not enough content to create flashcards, return one empty flashcard exactly like this:
              Front: Empty card
              Back: Empty card
              `,
          }, 
          {
            role: 'user',
            content: 
              `Here is an example of the input and expected output:
      
              **Example Input:**
              ${exampleText}
      
              **Example Output:**
              ${exampleCards}
      
              Now, convert the following text into flashcards with detail level ${detailLevel}/3:
              ${content.substring(0, Math.min(content.length, 4000))}`
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
    const { content, detailLevel } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content provided' },
        { status: 400 }
      );
    }

    // Limit content length to prevent oversize requests
    const trimmedContent = content.substring(0, Math.min(content.length, 8000));
    console.log(`Processing content (${trimmedContent.length} chars) with detail level ${detailLevel}...`);

    // Send request to OpenAI with retry logic and pass the detailLevel
    const response = await callOpenAIWithRetry(trimmedContent, detailLevel);

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