export interface FlashCard {
    id: string;
    front: string;
    back: string;
}
  
export interface GameStats {
    wpm: number;
    accuracy: number;
    time: number;
}