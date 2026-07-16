import type { QuestionStatus, QuizQuestion } from "@/types";

import { mapQuizQuestion, type QuizQuestionDto } from "./articles";
import { apiClient } from "./client";

/**
 * Sets a question's status - called automatically after a quiz answer is
 * graded in QuizSession, and also usable for manual overrides.
 */
export async function updateQuestionStatus(
  questionId: string,
  status: QuestionStatus
): Promise<QuizQuestion> {
  const { data } = await apiClient.patch<QuizQuestionDto>(
    `/v1/questions/${questionId}/status`,
    { status }
  );
  return mapQuizQuestion(data);
}
