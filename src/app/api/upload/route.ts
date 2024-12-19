// app/api/upload/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    // Read file content
    const text = await file.text()
    
    return NextResponse.json({ text })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}

