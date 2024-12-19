'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('') // New state for response
  const router = useRouter()

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === 'text/plain' || droppedFile?.type === 'application/pdf') {
      setFile(droppedFile)
    } else {
      setError('Please upload a .txt or .pdf file')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResponse('') // Clear previous response

    try {
      let content = text

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) throw new Error('Upload failed')
        
        const { text: fileText } = await uploadResponse.json()
        content = fileText
      }

      // Process with OpenAI
      const aiResponse = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      })

      if (!aiResponse.ok) throw new Error('Processing failed')

      const result = await aiResponse.json()
      console.log('API Response:', result); // Log the response to inspect its structure
      
      // Set the response text
      setResponse(result.responseText || 'Quiz created successfully!')
      // Optionally navigate to another page if needed
      // router.push(`/quiz?id=${result.quizId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
    

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Upload Your Study Material
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Upload your notes or paste them directly. We'll transform them into an interactive typing exercise.
          </p>
        </div>

        {/* Upload Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-50">
          {/* File Drop Zone */}
          <div 
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 mb-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
          >
            <input
              type="file"
              onChange={handleFileInput}
              accept=".txt,.pdf"
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <svg 
                  className="w-12 h-12 text-gray-400 mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">
                  {file ? file.name : 'Drop your file here or click to upload'}
                </span>
              </div>
            </label>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or paste your notes directly:</div>
            <textarea
              value={text}
              onChange={handleTextInput}
              className="w-full h-48 p-4 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Paste your study notes here..."
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          {response && (
            <div className="mb-4 text-green-500 text-sm">
              {response}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || (!file && !text)}
            className={`w-full py-3 rounded-lg text-white font-medium relative
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Create Quiz'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
