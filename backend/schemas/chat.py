from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------
# Core chat message schema
# -----------------------------
class ChatMessage(BaseModel):
    """
    Single message in chat-style conversation
    (used by frontend to render ChatGPT-like UI)
    """
    role: Literal["user", "assistant"]
    content: str

    # Optional metadata for internal use
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Internal data (confidence, disease, flags)"
    )


# -----------------------------
# Conversation state (in-memory)
# -----------------------------
class ConversationState(BaseModel):
    """
    Tracks ongoing diagnostic conversation
    (NO DB, session-based or request-based)
    """
    session_id: str
    messages: List[ChatMessage] = []

    # provisional medical state
    provisional_disease: Optional[str] = None
    confidence: Optional[float] = None

    # decision flags
    requires_followup: bool = False
    high_risk: bool = False

    # extracted structured info from chat
    extracted_symptoms: Dict[str, Any] = Field(
        default_factory=dict,
        description="Key medical signals extracted from conversation"
    )


# -----------------------------
# API response schema
# -----------------------------
class ChatResponse(BaseModel):
    """
    Response sent to frontend after each interaction
    """
    conversation: List[ChatMessage]
    status: Literal[
        "INITIAL",
        "ASKING_QUESTIONS",
        "FINAL_DIAGNOSIS",
        "HIGH_RISK"
    ]

    # Optional final decision info
    disease: Optional[str] = None
    confidence: Optional[float] = None
