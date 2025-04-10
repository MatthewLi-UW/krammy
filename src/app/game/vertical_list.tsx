'use client';

import { FlashCard } from "@/types/FlashCard";
import { useState } from "react";

interface VerticalListProps {
  flashcards: FlashCard[];
  deckName: string;
}

export default function VerticalList({ flashcards, deckName }: VerticalListProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedCard, setEditedCard] = useState<FlashCard | null>(null);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditedCard({...flashcards[index]});
  };

  const handleSave = async (index: number) => {
    setEditIndex(null);
    setEditedCard(null);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditedCard(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 border-b-2 border-teal-500 pb-3">
        {deckName} - Study List
      </h2>
      
      <div className="space-y-6">
        {flashcards.map((card, index) => (
          <div 
            key={card.card_id} 
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            {editIndex === index ? (
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                  <textarea
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={editedCard?.front}
                    rows={2}
                    onChange={(e) => setEditedCard({...editedCard!, front: e.target.value})}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Definition</label>
                  <textarea
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={editedCard?.back}
                    rows={3}
                    onChange={(e) => setEditedCard({...editedCard!, back: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleSave(index)}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row">
                <div className="p-6 md:w-1/2 bg-gradient-to-r from-teal-50 to-white border-b md:border-b-0 md:border-r border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Term</h3>
                  <p className="text-xl text-gray-800">{card.front}</p>
                </div>
                <div className="p-6 md:w-1/2 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Definition</h3>
                    <p className="text-xl text-gray-800">{card.back}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handleEdit(index)}
                      className="px-3 py-1 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}