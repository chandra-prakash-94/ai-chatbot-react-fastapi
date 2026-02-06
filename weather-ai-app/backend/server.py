import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="Weather AI Agent")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.app\.github\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------- Weather Schema ----------------
class WeatherResponse(BaseModel):
    city: str = Field(description="City and country")
    temperature: str = Field(description="Temperature with unit")
    condition: str = Field(description="Weather condition")
    humidity: str = Field(description="Humidity percentage")
    wind: str = Field(description="Wind speed and direction")


# ---------------- LLM Setup ----------------
llm = init_chat_model("google_genai:gemini-2.5-flash-lite")

structured_llm = llm.with_structured_output(
    schema=WeatherResponse,
    method="function_calling"
)

# ---------------- WEATHER DATA ENDPOINT ----------------
@app.get("/weather", response_model=WeatherResponse)
async def get_weather(city: str):
    try:
        search_query = (
            f"What is the current weather in {city}? "
            "Provide temperature, condition, humidity, and wind speed."
        )

        search_result = llm.invoke(search_query, tools=[{"google_search": {}}])
        raw_text = getattr(search_result, "content", str(search_result))

        if not raw_text:
            raise HTTPException(status_code=404, detail="Weather data not found")

        extraction_prompt = f"Extract structured weather for {city}: {raw_text}"
        structured_data = structured_llm.invoke(extraction_prompt)

        return structured_data.dict() if hasattr(structured_data, "dict") else structured_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- TOOL FOR AI ----------------
# LLM will "call" this, but frontend executes it
@tool
def get_weather_tool(city: str) -> str:
    """Get current weather for a city"""
    return city


tools = [get_weather_tool]

# Bind tools to model (modern tool-calling)
llm_with_tools = llm.bind_tools(tools)


# ---------------- COPILOTKIT CHAT ENDPOINT ----------------
@app.post("/copilotkit")
async def copilotkit_chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])

    if not messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    user_message = messages[-1]["content"]

    response = llm_with_tools.invoke(user_message)

    # Extract tool calls if present
    tool_calls = getattr(response, "tool_calls", [])

    return {
        "message": response.content or "",
        "tool_calls": tool_calls,
    }

@app.get("/copilotkit/info")
async def copilotkit_info():
    return {
        "tools": [
            {
                "name": "get_weather_tool",
                "description": "Get current weather for a city",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {
                            "type": "string",
                            "description": "City name"
                        }
                    },
                    "required": ["city"]
                }
            }
        ]
    }


# ---------------- RUN ----------------
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
