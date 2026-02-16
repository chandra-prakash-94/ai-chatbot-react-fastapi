# server.py
import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.chat_models import init_chat_model
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # demo only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = init_chat_model(
    model="gemini-2.5-flash-lite",
    model_provider="google_genai",
    streaming=True,
)

class ChatRequest(BaseModel):
    messages: list


@app.post("/api/chat")
async def chat(request: ChatRequest):

    async def stream():
        user_message = request.messages[-1]["content"]

        async for chunk in llm.astream(user_message):
            if chunk.content:
                yield f"data: {json.dumps({'content': chunk.content})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)