from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: UUID,
    title: str,
    message: str,
    notification_type: str = "system",
    related_id: Optional[str] = None,
) -> Notification:
    """Helper to dispatch in-app notifications to candidate or recruiter."""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_id=related_id,
        is_read=False,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

