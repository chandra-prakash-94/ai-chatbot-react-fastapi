##fastapi_app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

llm= init_chat_model("google_genai:gemini-2.5-flash-lite")

# -------- API Endpoint --------
@app.get("/")
async def root():
    return {"message": "Welcome to the Chat API"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response_text = await llm.ainvoke(request.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Model request failed")
    return ChatResponse(response=response_text.content)

if __name__=="__main__":
    import uvicorn
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=8000, reload=True)
