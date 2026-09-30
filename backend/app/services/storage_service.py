import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_EXTENSIONS = {
    "pdf", "pptx", "ppt", "docx", "doc", "txt", "csv", "nc", "mp4", "png", "jpg", "jpeg"
}

class StorageService:
    @staticmethod
    def ensure_upload_dir():
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    @classmethod
    async def save_file(cls, file: UploadFile) -> dict:
        cls.ensure_upload_dir()
        
        # Check filename
        if not file.filename:
            raise HTTPException(status_code=400, detail="Uploaded file has no filename.")

        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File extension '{ext}' not allowed. Permitted formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )

        # Generate unique safe filename
        safe_filename = f"{uuid.uuid4().hex}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        size_kb = 0
        async with aiofiles.open(file_path, "wb") as out_file:
            while content := await file.read(1024 * 1024):  # 1MB chunks
                size_kb += len(content) // 1024
                if size_kb > (settings.MAX_UPLOAD_SIZE_MB * 1024):
                    # Clean up and reject
                    try:
                        os.remove(file_path)
                    except OSError:
                        pass
                    raise HTTPException(
                        status_code=400,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                await out_file.write(content)

        return {
            "filename": safe_filename,
            "original_name": file.filename,
            "file_url": f"/uploads/{safe_filename}",
            "file_size_kb": max(1, size_kb),
            "file_type": ext
        }
