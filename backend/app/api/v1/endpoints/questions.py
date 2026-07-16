from fastapi import APIRouter, HTTPException

from app.schemas.question import QuizQuestionResponse, QuizQuestionStatusUpdateRequest
from app.services.article_service import update_quiz_question_status

router = APIRouter(prefix="/questions", tags=["questions"])


@router.patch("/{question_id}/status", response_model=QuizQuestionResponse)
def update_question_status(question_id: str, payload: QuizQuestionStatusUpdateRequest):
    """Sets a question's status. Called automatically after a quiz answer is
    graded, and reusable for any future manual override UI."""

    question = update_quiz_question_status(question_id, payload.status)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
