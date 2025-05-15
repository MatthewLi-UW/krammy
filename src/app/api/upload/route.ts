// app/api/upload/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    let text = '';
    
    // We now only handle text files here, PDFs are processed by Flask backend
    if (file.type === 'text/plain') {
      // For text files, simple extraction works
      text = await file.text();
    } else {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}` 
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (!text || text.length === 0) {
      return NextResponse.json({ 
        error: 'No text could be extracted from the file' 
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // console.log(`Extracted ${text.length} characters of text`);
    return NextResponse.json({ text }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: `Server error: ${error.message || 'Unknown error'}` 
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

