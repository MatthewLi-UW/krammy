/*
THIS FILE HANDLES THE OVERALL FLASHCARD ALTERNATING PROCESS
*/

import Link from 'next/link';
import FlashcardStack from "../game/stack"
import KrammyLogo from "../components/logo"

const Header = () => (
  <div className="fixed top-0 left-0 p-6 flex items-center gap-3">
    <Link legacyBehavior href="/">
      <a className="flex items-center gap-3">
        <KrammyLogo width={40} height={40} />
        <span className="text-2xl font-bold text-gray-800">Krammy</span>
      </a>
    </Link>
  </div>
);

export default function Home() {
  return (
    <main className="flex min-h-screen bg-[#F0F4F8]">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-700">
            Flashcard deck title
          </h2>
          <FlashcardStack />
        </div>
      </div>
    </main>
  )
}