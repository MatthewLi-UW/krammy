"use client"

import { Brain, Keyboard, LineChart } from "lucide-react"
import { useState } from "react"

export default function FeatureBanner() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const features = [
    {
      icon: Brain,
      title: "Smart Note Processing",
      description: "Our AI analyzes your notes and creates personalized typing exercises.",
    },
    {
      icon: Keyboard,
      title: "Type to Memorize",
      description: "Boost retention through active recall and typing practice.",
    },
    {
      icon: LineChart,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics.",
    },
  ]

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* if we want a header insert it here */}
        <h2 className="text-4xl font-medium text-text-teal text-center mb-12"></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative bg-beige-medium rounded-xl p-8 border ${
                hoveredIndex === index 
                ? 'scale-105 shadow-lg border-primary' 
                : 'scale-100 shadow-sm border-border'
              } transition-all duration-300 ease-in-out cursor-pointer`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 p-3 rounded-full bg-primary/10 ${
                  hoveredIndex === index ? 'scale-101' : 'scale-100'
                } transition-transform duration-300 ease-in-out`}>
                  <feature.icon className="h-8 w-8 text-primary text-text-teal" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 text-text-teal ${
                  hoveredIndex === index ? 'scale-101' : 'scale-100'
                } transition-transform duration-300 ease-in-out`}>
                  {feature.title}
                </h3>
                <p className={`text-muted-foreground ${
                  hoveredIndex === index ? 'scale-101' : 'scale-100'
                } transition-transform duration-300 ease-in-out`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}