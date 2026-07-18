import { create } from "zustand";

interface ReviewSessionState {
  currentIndex: number;
  score: number;
  answers: Record<string, string>;
  submitAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
  next: () => void;
  previous: () => void;
  reset: () => void;
}

/**
 * Ephemeral state for a single quiz / flash-card review session
 * (quiz/vocabulary, quiz/sentence, cards/flash). Intentionally not
 * persisted - a session resets whenever the user leaves the flow.
 */
export const useReviewStore = create<ReviewSessionState>((set) => ({
  currentIndex: 0,
  score: 0,
  answers: {},
  submitAnswer: (questionId, answer, isCorrect) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
      score: isCorrect ? state.score + 1 : state.score,
    })),
  next: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
  previous: () => set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),
  reset: () => set({ currentIndex: 0, score: 0, answers: {} }),
}));
