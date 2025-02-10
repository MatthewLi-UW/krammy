'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const router = useRouter()

  const handleFileDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === 'text/plain' || droppedFile?.type === 'application/pdf') {
      setFile(droppedFile)
    } else {
      setError('Please upload a .txt or .pdf file')
    }
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleTextInput = (e) => {
    setText(e.target.value)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResponse('')

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

      const aiResponse = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      })

      if (!aiResponse.ok) throw new Error('Processing failed')

      const result = await aiResponse.json()
      console.log("Successfully created quiz")
      setResponse(result.responseText || 'Quiz created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-6 pt-20"
      >
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-serif text-gray-900"
          >
            Upload your study material
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-4 text-gray-600"
          >
            Upload your notes or paste them directly. We'll transform them into an interactive typing exercise.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
        >
          <motion.div 
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 mb-6 text-center hover:border-gray-300 transition-all duration-300 cursor-pointer"
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
                  className="w-8 h-8 text-gray-400 mb-4" 
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
                <span className="text-gray-600">
                  {file ? file.name : 'Drop your file here or click to upload'}
                </span>
              </div>
            </label>
          </motion.div>

          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Or paste your notes directly:</div>
            <textarea
              value={text}
              onChange={handleTextInput}
              className="w-full h-48 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Paste your study notes here..."
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          {response && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-green-600 text-sm"
            >
              {response}
            </motion.div>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={loading || (!file && !text)}
            className={`w-full py-3 rounded-lg text-white font-medium relative
              ${loading 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-[#B65F3C] hover:bg-[#A35432] transition-colors duration-300'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center text-gray-600">
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
          </motion.button>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/game">
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300">
              Play Typing Game
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}