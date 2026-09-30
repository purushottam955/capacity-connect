from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Notification, Announcement, User
from app.schemas.schemas import AnnouncementCreate
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="", tags=["Notifications & Announcements"])

@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "link": n.link,
        "type": n.type,
        "is_read": n.is_read,
        "created_at": n.created_at
    } for n in notifs]

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Notification marked read"}

@router.put("/notifications/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked read"}

@router.get("/announcements")
def list_announcements(
    db: Session = Depends(get_db)
):
    items = db.query(Announcement).order_by(Announcement.created_at.desc()).limit(15).all()
    results = []
    for a in items:
        author = db.query(User).filter(User.id == a.created_by).first()
        results.append({
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "target_role": a.target_role,
            "priority": a.priority,
            "author_name": author.full_name if author else "Ministry Administrator",
            "created_at": a.created_at
        })
    return results

@router.post("/announcements")
def create_announcement(
    req: AnnouncementCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    a = Announcement(
        title=req.title,
        content=req.content,
        target_role=req.target_role,
        priority=req.priority,
        created_by=current_user.id
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"id": a.id, "title": a.title, "message": "Announcement broadcast successfully"}
