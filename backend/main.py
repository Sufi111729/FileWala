from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError
from rembg import remove

MAX_FILE_SIZE = 15 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

app = FastAPI(title="FileWalaTool Background Remover API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...)) -> StreamingResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Invalid file type. Upload a JPG, JPEG, PNG, or WEBP image.",
        )

    try:
        image_bytes = await file.read(MAX_FILE_SIZE + 1)
    finally:
        await file.close()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Image must be smaller than 15 MB.")

    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image.verify()
        output_bytes = remove(image_bytes)
    except UnidentifiedImageError as error:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Background removal failed.") from error

    return StreamingResponse(
        BytesIO(output_bytes),
        media_type="image/png",
        headers={"Content-Disposition": 'inline; filename="background-removed.png"'},
    )
