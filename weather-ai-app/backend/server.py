import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()


app = FastAPI(title="Weather AI Agent")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WeatherResponse(BaseModel):
    city: str = Field(
        description="The name of the city and state/country if applicable, e.g., 'Hyderabad, India'"
    )
    temperature: str = Field(
        description="The current temperature including the unit, e.g., '28°C' or '82°F'"
    )
    condition: str = Field(
        description="A brief description of the weather, e.g., 'Sunny', 'Heavy Rain', or 'Cloudy'"
    )
    humidity: str = Field(
        description="The humidity percentage, e.g., '65%'"
    )
    wind: str = Field(
        description="The wind speed and direction, e.g., '10 km/h NW'"
    )

# 2. Initialize Models
# We use the base model for searching and the structured version for parsing
llm = init_chat_model("google_genai:gemini-2.5-flash-lite") 

structured_llm = llm.with_structured_output(
    schema=WeatherResponse, 
    method="function_calling"
)

@app.get("/weather", response_model=WeatherResponse)
async def get_weather(city: str):
    try:
        # STEP 1: Search for real-time data
        # Using Google Search grounding to get the latest info
        search_query = f"What is the current weather in {city}? Provide details on temperature, condition, humidity, and wind speed."
        
        search_result = llm.invoke(
            search_query, 
            tools=[{"google_search": {}}] 
        )
        
        # Grab the grounded text content
        raw_text = search_result.content
        
        if not raw_text:
            raise HTTPException(status_code=404, detail="Weather data not found from search.")

        # STEP 2: Extract structured data from the search result
        # We pass the search context to the structured LLM
        extraction_prompt = f"Based on this info, extract weather for {city}: {raw_text}"
        structured_data = structured_llm.invoke(extraction_prompt)

        if not structured_data:
            raise HTTPException(status_code=500, detail="Failed to structure weather data.")

        return structured_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)