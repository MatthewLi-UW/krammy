'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

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
      setResponse(result.responseText || 'Quiz created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto pt-20"
      >
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          >
            Upload Your Study Material
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-4 text-gray-300"
          >
            Upload your notes or paste them directly. We'll transform them into an interactive typing exercise.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="backdrop-blur-lg bg-gray-800/30 rounded-2xl shadow-2xl p-8 border border-gray-700/30"
        >
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-600 rounded-xl p-8 mb-6 text-center hover:border-indigo-500 transition-all duration-300 cursor-pointer bg-gray-800/50"
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
                <motion.svg 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 text-indigo-400 mb-4" 
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
                </motion.svg>
                <span className="text-gray-300">
                  {file ? file.name : 'Drop your file here or click to upload'}
                </span>
              </div>
            </label>
          </motion.div>

          <div className="mb-6">
            <div className="text-sm text-gray-300 mb-2">Or paste your notes directly:</div>
            <textarea
              value={text}
              onChange={handleTextInput}
              className="w-full h-48 p-4 rounded-lg bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-gray-200 placeholder-gray-500"
              placeholder="Paste your study notes here..."
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {response && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-green-400 text-sm"
            >
              {response}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading || (!file && !text)}
            className={`w-full py-3 rounded-lg text-white font-medium relative overflow-hidden
              ${loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300'
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
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}