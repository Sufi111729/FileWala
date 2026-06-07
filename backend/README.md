# Background Remover API

Create a virtual environment, install dependencies, and run the FastAPI service:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The Vite development server proxies `/api/remove-background` to `http://127.0.0.1:8000`.
The first background-removal request may download the open-source model used by `rembg`.

For production, deploy this directory as a Python service and route the website's
`/api/remove-background` request to that service. Uploaded images are processed in
memory and are not written to disk.
