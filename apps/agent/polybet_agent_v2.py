import os
import time
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import uuid4
from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low
import openai
from dotenv import load_dotenv

from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    chat_protocol_spec
)

# Initialize the chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)




# Load environment variables
load_dotenv()

class StructuredQuery(Model):
    query: str
    parameters: Optional[Dict[str, Any]] = None

class PolyBetResponse(Model):
    recommendations: List[Dict[str, str]]
    message: str
    type: str = "polybet_response"

# Rate limiting
class RateLimiter:
    def __init__(self, max_requests=30, time_window=3600):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = {}
    
    def is_allowed(self, user_id: str) -> bool:
        now = time.time()
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # Clean old requests
        self.requests[user_id] = [req_time for req_time in self.requests[user_id] 
                                  if now - req_time < self.time_window]
        
        if len(self.requests[user_id]) >= self.max_requests:
            return False
        
        self.requests[user_id].append(now)
        return True

# Initialize components
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
openai.api_key = os.getenv("OPENAI_API_KEY")
rate_limiter = RateLimiter()

# Debug environment variables
print(f"🔧 Environment check:")
print(f"   Supabase URL: {'✅ Set' if supabase_url else '❌ Missing'}")
print(f"   Supabase Key: {'✅ Set' if supabase_key else '❌ Missing'}")
print(f"   OpenAI Key: {'✅ Set' if openai.api_key else '❌ Missing'}")

# Supabase REST API headers
supabase_headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Create ASI-compatible mailbox agent
agent = Agent(
    name="Polybets-Market-Finder",
    seed="polybet_market_agent_seed_25",
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"],
    mailbox=True,
    agentverse={"api_key": os.getenv("ACCESS_TOKEN")}
)

# Fund agent if needed
fund_agent_if_low(agent.wallet.address())

def get_markets_from_supabase() -> List[Dict[str, Any]]:
    """Fetch all markets from Supabase using REST API"""
    try:
        url = f"{supabase_url}/rest/v1/markets"
        print(f"🔍 Fetching markets from: {url}")
        response = requests.get(url, headers=supabase_headers, timeout=10)
        print(f"📊 Response status: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        print(f"📈 Found {len(data)} markets")
        return data
    except requests.exceptions.RequestException as e:
        print(f"Network error fetching markets: {e}")
        return []
    except ValueError as e:
        print(f"JSON parsing error fetching markets: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error fetching markets: {e}")
        return []

def get_external_markets_from_supabase() -> List[Dict[str, Any]]:
    """Fetch all external markets with marketplace info from Supabase using REST API"""
    try:
        url = f"{supabase_url}/rest/v1/external_markets"
        params = {
            "select": "*,marketplaces(name,chain_name,chain_family)"
        }
        print(f"🔍 Fetching external markets from: {url}")
        response = requests.get(url, headers=supabase_headers, params=params, timeout=10)
        print(f"📊 Response status: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        print(f"📈 Found {len(data)} external markets")
        return data
    except requests.exceptions.RequestException as e:
        print(f"Network error fetching external markets: {e}")
        return []
    except ValueError as e:
        print(f"JSON parsing error fetching external markets: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error fetching external markets: {e}")
        return []

def filter_markets_with_llm(user_query: str, markets: List[Dict[str, Any]], market_type: str) -> List[Dict[str, Any]]:
    """Use LLM to filter markets based on user query"""
    try:
        if not markets:
            return []
        
        # Prepare market descriptions for LLM
        market_descriptions = []
        for market in markets:
            if market_type == "internal":
                desc = f"ID: {market['id']}, Question: {market['common_question']}, Options: {market['options']}"
            else:
                desc = f"ID: {market['id']}, Question: {market['question']}, Marketplace: {market.get('marketplaces', {}).get('name', 'Unknown')}"
            market_descriptions.append(desc)
        
        prompt = f"""
        User wants to bet on: "{user_query}"
        
        Here are available {market_type} markets:
        {chr(10).join(market_descriptions)}
        
        Please identify which markets are most relevant to the user's query. Return only the market IDs that match, separated by commas. If no markets match, return "NONE".
        """
        
        # Use OpenAI to filter markets
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that matches betting markets to user queries."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.3
        )
        
        result = response.choices[0].message.content.strip()
        
        if result == "NONE":
            return []
        
        # Parse the result and filter markets
        relevant_ids = [int(id.strip()) for id in result.split(",") if id.strip().isdigit()]
        filtered_markets = [market for market in markets if market['id'] in relevant_ids]
        
        return filtered_markets
        
    except Exception as e:
        print(f"Error filtering markets with LLM: {e}")
        return []

def extract_query_parameters(text: str) -> Dict[str, Any]:
    """Extract structured parameters from natural language using LLM"""
    try:
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """Extract betting market query parameters from user text. 
                Return JSON with: market_type (sports/crypto/politics/weather/etc), timeframe, specific_terms, confidence_level.
                If unclear, set to null."""},
                {"role": "user", "content": text}
            ],
            max_tokens=200,
            temperature=0.1
        )
        
        import json
        result = response.choices[0].message.content.strip()
        return json.loads(result)
    except Exception as e:
        print(f"Error extracting parameters: {e}")
        return {}

def process_market_recommendation(user_query: str) -> PolyBetResponse:
    """Process market recommendation request"""
    try:
        print(f"🔍 Processing query: {user_query}")
        
        # Step 1: Get all markets
        internal_markets = get_markets_from_supabase()
        external_markets = get_external_markets_from_supabase()
        
        print(f"📊 Total markets found - Internal: {len(internal_markets)}, External: {len(external_markets)}")
        
        # If no markets found at all, provide a different message
        if not internal_markets and not external_markets:
            return PolyBetResponse(
                recommendations=[],
                message="No markets are currently available in the database. Please check your Supabase connection."
            )
        
        # For debugging, let's return some markets without LLM filtering first
        recommendations = []
        
        # Add first few internal markets for testing
        for market in internal_markets[:3]:
            recommendations.append({
                "question": market.get("common_question", "Unknown question"),
                "url": market.get("url") or "#",  # Handle None values
                "type": "PolyBets Platform",
                "options": ", ".join(market.get("options", []) if market.get("options") else [])
            })
        
        # Add first few external markets for testing
        for market in external_markets[:3]:
            marketplace_name = market.get("marketplaces", {}).get("name", "Unknown") if market.get("marketplaces") else "Unknown"
            recommendations.append({
                "question": market.get("question", "Unknown question"),
                "url": market.get("url") or "#",  # Handle None values
                "type": f"External - {marketplace_name}",
                "options": "Variable"
            })
        
        if not recommendations:
            return PolyBetResponse(
                recommendations=[],
                message="Markets were found in the database but could not be processed. Check the data structure."
            )
        
        return PolyBetResponse(
            recommendations=recommendations,
            message="Here are some available markets (Debug mode - showing first few):"
        )
        
    except Exception as e:
        print(f"Error processing recommendation: {e}")
        return PolyBetResponse(
            recommendations=[],
            message=f"Sorry, I encountered an error while searching for markets: {str(e)}"
        )

# Create protocols
structured_protocol = Protocol("StructuredOutput")

@agent.on_event("startup")
async def startup_function(ctx: Context):
    print("🚀 PolyBet Market Agent starting up...")
    print(f"📍 Agent address: {agent.address}")
    print("🏷️  Agent name: Polybets-Market-Finder")
    print("✅ Ready to help with betting market recommendations!")
    print("👀 Waiting for messages...")
    ctx.logger.info("PolyBet Market Agent starting up...")
    ctx.logger.info(f"Agent address: {agent.address}")
    ctx.logger.info("Agent name: Polybets-Market-Finder")
    ctx.logger.info("Ready to help with betting market recommendations!")

# Chat Protocol Handler (for protocol-specific handling if needed)
# Main handling is done in the agent's direct message handler

# Structured Protocol Handler
@structured_protocol.on_message(model=StructuredQuery)
async def handle_structured_query(ctx: Context, sender: str, msg: StructuredQuery):
    """Handle structured queries with parameters"""
    print(f"🔥 STRUCTURED MESSAGE RECEIVED! From: {sender}, Query: {msg.query}")
    ctx.logger.info(f"Received structured query from {sender}: {msg.query}")
    
    # Rate limiting
    if not rate_limiter.is_allowed(sender):
        await ctx.send(sender, PolyBetResponse(
            recommendations=[],
            message="Rate limit exceeded. Please try again later.",
            type="error"
        ))
        return
    
    # Process the recommendation
    response = process_market_recommendation(msg.query)
    await ctx.send(sender, response)
    
    ctx.logger.info(f"Sent {len(response.recommendations)} structured recommendations to {sender}")

# Main message handler (consolidates health check and chat)
@chat_proto.on_message(model=ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """Main message handler for all ChatMessage types"""
    # Extract text from content
    text_content = ""
    if msg.content and len(msg.content) > 0:
        for content in msg.content:
            if hasattr(content, 'text'):
                text_content += content.text + " "
    text_content = text_content.strip()
    
    print(f"🔥 MESSAGE RECEIVED! From: {sender}, Text: {text_content}")
    ctx.logger.info(f"🔥 MESSAGE RECEIVED! From: {sender}, Text: {text_content}")
    
    # Send acknowledgment
    ack = ChatAcknowledgement(
        timestamp=datetime.utcnow(),
        acknowledged_msg_id=msg.msg_id
    )
    await ctx.send(sender, ack)

    # Health check
    if text_content.lower() in ["health", "status", "ping"]:
        print(f"💚 Health check request from {sender}")
        response = ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[TextContent(type="text", text="PolyBet Market Agent is healthy and ready to help with betting market recommendations!")]
        )
        await ctx.send(sender, response)
        return
    
    # Regular chat message handling
    print(f"🎯 Processing betting query from {sender}: {text_content}")
    ctx.logger.info(f"Received chat message from {sender}: {text_content}")
    
    # Rate limiting
    if not rate_limiter.is_allowed(sender):
        response = ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[TextContent(type="text", text="Rate limit exceeded. Please try again later.")]
        )
        await ctx.send(sender, response)
        return
    
    # Extract parameters and process query
    polybet_response = process_market_recommendation(text_content)
    
    # Format response for chat
    formatted_message = f"{polybet_response.message}\n"
    if polybet_response.recommendations:
        for i, rec in enumerate(polybet_response.recommendations[:5], 1):  # Limit to 5 results
            formatted_message += f"{i}. {rec['question']} ({rec['type']})\n"
            if rec['url'] != "#":
                formatted_message += f"   Link: {rec['url']}\n"
    
    # Send response message
    response = ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[TextContent(type="text", text=formatted_message)]
    )
    await ctx.send(sender, response)
    ctx.logger.info(f"Sent {len(polybet_response.recommendations)} recommendations to {sender}")


# Acknowledgement Handler - Process received acknowledgements
@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Received acknowledgement from {sender} for message: {msg.acknowledged_msg_id}")

# Include structured protocol only (chat handled directly by agent)
agent.include(structured_protocol)
agent.include(chat_proto)

if __name__ == "__main__":
    agent.run()