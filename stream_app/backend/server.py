import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain.chat_models import init_chat_model

load_dotenv()

app = FastAPI()

# Allow React frontend (very open for demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For PoC only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model
llm = init_chat_model(
    model="gemini-2.5-flash-lite",
    model_provider="google_genai",
    streaming=True,
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    async def event_stream():
        async for chunk in llm.astream(request.message):
            if chunk.content:
                yield f"{chunk.content}\n\n"
        yield "event: done\ndata: [DONE]\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
