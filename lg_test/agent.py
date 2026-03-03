
import uuid
from typing import TypedDict, Annotated, Sequence
from langgraph.graph.message import add_messages
from langgraph.graph import START, END, StateGraph
from langchain.messages import AnyMessage, AIMessage
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langgraph.graph.ui import AnyUIMessage, ui_message_reducer, push_ui_message
load_dotenv()


class ChatState(TypedDict):
    messages: Annotated[Sequence[AnyMessage], add_messages]
    ui: Annotated[Sequence[AnyUIMessage], ui_message_reducer]


llm = init_chat_model("google_genai:gemini-2.5-flash")


def chat_node(state: ChatState) -> ChatState:
    messages = state["messages"]
    response = llm.invoke(messages)

    # Example: If user asks about weather, emit a Gen UI message
    # (In real use, parse intent from response or messages)
    if "weather" in str(messages[-1].content).lower():
        city = "Delhi"  # Example city, could be parsed from user input
        ui_payload = {"city": city}
        ai_msg = AIMessage(
            id=str(uuid.uuid4()),
            content=f"Here's the weather for {city}",
        )
        push_ui_message("weather", ui_payload, message=ai_msg)
        return {"messages": [ai_msg]}

    return {"messages": [response]}


graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

app = graph.compile()
