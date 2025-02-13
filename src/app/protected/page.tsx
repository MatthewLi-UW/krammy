"use client"; 

import { createClient } from "@/utils/supabase/client";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();
  useEffect(() => {
    // Initialize Supabase client
    const supabase = createClient();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
      } else {
        const temp = data.user as User;
        setUser(temp ? { id: temp.id, email: temp.email } : null);
        setLoading(false);
      }
    
    }
      fetchUser();

  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
      </div>
    </div>
  );
}