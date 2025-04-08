'use client';

/*
THIS FILE HANDLES THE OVERALL FLASHCARD ALTERNATING PROCESS
*/

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FlashcardStack from "../game/stack";
import Header from "../components/header";
import { supabase } from "@/utils/supabase/client";
import { User } from "@/types/user";

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
      } else {
        const temp = data.user as User;
        setUser(temp ? { 
          id: temp.id, 
          email: temp.email,
          image: temp.user_metadata?.avatar_url || undefined
        } : null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#F0F4F8]">
      {/* Header component */}
      <Header user={user} />
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-700">
            Flashcard deck title
          </h2>
          <FlashcardStack />
        </div>
      </div>
    </main>
  );
}