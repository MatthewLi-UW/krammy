"use client"; 

import { supabase } from "@/utils/supabase/client";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/User";
import { flashcards } from "../game/flashcard_array";
import { createDeck, sendData } from "@/utils/sendData";
import { Deck } from "@/types/deck";
import { FlashCard } from "@/types/FlashCard";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();


  useEffect(() => {

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
  const test = async () => {

    try{
      if(user) {
        //Create an empty deck
        const data = (await createDeck(user.id))[0] as Deck;
        console.log(data)
        

        //Upload An array of cards
        const CardsWithUID = flashcards.map(item => ({...item, owner_id: user.id}) )
        const cards = (await sendData('FlashCard',CardsWithUID)) as FlashCard[];
        console.log(cards)

        //We only want the ids for link
        const ArrayofCardID = (await cards).map(item => item.card_id);

        //Crate the CardsToDeck object to prepare for upload
        const ConnectedCards = ArrayofCardID.map(card_id => ({
          card_id, 
          owner_id: user.id, 
          deck_id: data.deck_id
        }));

        //Upload the link!
        const connectCardsTodeck = sendData('CardsToDeck', ConnectedCards );
        console.log(connectCardsTodeck);
        
      }
    } catch(e ){
      console.error(e)
    }
 

  };
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
        <button onClick={test} id="emailSignUp" className="w-full px-4 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors">
                      Continue with email
                    </button>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
      </div>
    </div>
  );
}