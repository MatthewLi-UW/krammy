import type React from "react"

interface KrammyLogoProps {
  width?: number
  height?: number
}

const KrammyLogo: React.FC<KrammyLogoProps> = ({ width = 200, height = 200 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200"/>
      <rect x="10" y="10" width="180" height="180" rx="36" fill="#FFB74D" />
      <rect x="30" y="30" width="140" height="140" rx="28" fill="#FFD54F" />
      <rect x="50" y="50" width="100" height="100" rx="20" fill="#FFECB3" />
      <path d="M115 70L85 100L115 130" stroke="#FF8A65" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <text
        x="100"
        y="180"
        fontFamily="Inter, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="#FF8A65"
        textAnchor="middle"
      >
      </text>
    </svg>
  )
}

export default KrammyLogo
