import os
import base64
from PIL import Image
import io
from typing import Optional
from fastapi import UploadFile, HTTPException
import uuid
from datetime import datetime

# Storage configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def ensure_upload_dir():
    """Ensure upload directory exists"""
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

async def upload_image(file: Optional[UploadFile], user_id: int) -> Optional[str]:
    print("working here 2")
    """Upload and process image file"""
    ensure_upload_dir()
    
    # Handle case when no file is provided
    if not file:
        return None
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Read file content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Generate unique filename
    unique_filename = f"{user_id}_{uuid.uuid4().hex}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        # Process and compress image
        image = Image.open(io.BytesIO(content))
        
        # Convert to RGB if necessary
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Resize if too large
        max_size = (1200, 1200)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save compressed image
        image.save(file_path, "JPEG", quality=85, optimize=True)
        
        # Return relative URL
        return f"/uploads/{unique_filename}"
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

async def delete_image(image_url: str) -> bool:
    """Delete image file"""
    try:
        if image_url.startswith("/uploads/"):
            filename = image_url.replace("/uploads/", "")
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
    except Exception:
        pass
    return False

def get_image_base64(image_url: str) -> Optional[str]:
    """Get image as base64 string for AI processing"""
    try:
        if image_url.startswith("/uploads/"):
            filename = image_url.replace("/uploads/", "")
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    return base64.b64encode(f.read()).decode()
    except Exception:
        pass
    return None