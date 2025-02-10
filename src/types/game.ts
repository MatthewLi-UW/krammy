export interface Flashcard {
    id: string;
    front: string;
    back: string;
}
  
export interface GameStats {
    wpm: number;
    accuracy: number;
    time: number;
}