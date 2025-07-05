import os
import time
from typing import List, Dict, Any, Optional
from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low
from supabase import create_client, Client
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Chat Protocol Models
class ChatMessage(Model):
    text: str
    type: str = "text"

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
supabase: Client = create_client(supabase_url, supabase_key)
openai.api_key = os.getenv("OPENAI_API_KEY")
rate_limiter = RateLimiter()

# Create ASI-compatible mailbox agent
agent = Agent(
    name="polybet-market-agent-02",
    seed="polybet_market_agent_seed_2025",
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"],
    mailbox=True,
    agentverse={"api_key": os.getenv("ACCESS_TOKEN")}
)

# Fund agent if needed
fund_agent_if_low(agent.wallet.address())

def get_markets_from_supabase() -> List[Dict[str, Any]]:
    """Fetch all markets from Supabase"""
    try:
        response = supabase.table("markets").select("*").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching markets: {e}")
        return []

def get_external_markets_from_supabase() -> List[Dict[str, Any]]:
    """Fetch all external markets with marketplace info from Supabase"""
    try:
        response = supabase.table("external_markets").select("""
            *,
            marketplaces (
                name,
                chain_name,
                chain_family
            )
        """).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching external markets: {e}")
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
        # Step 1: Get all markets
        internal_markets = get_markets_from_supabase()
        external_markets = get_external_markets_from_supabase()
        
        # Step 2: Filter markets using LLM
        relevant_internal = filter_markets_with_llm(user_query, internal_markets, "internal")
        relevant_external = filter_markets_with_llm(user_query, external_markets, "external")
        
        # Step 3: Format recommendations
        recommendations = []
        
        # Add internal markets
        for market in relevant_internal:
            recommendations.append({
                "question": market["common_question"],
                "url": market.get("url", "#"),
                "type": "PolyBets Platform",
                "options": ", ".join(market.get("options", []))
            })
        
        # Add external markets
        for market in relevant_external:
            marketplace_name = market.get("marketplaces", {}).get("name", "Unknown")
            recommendations.append({
                "question": market["question"],
                "url": market.get("url", "#"),
                "type": f"External - {marketplace_name}",
                "options": "Variable"
            })
        
        if not recommendations:
            return PolyBetResponse(
                recommendations=[],
                message="Sorry, I couldn't find any relevant markets for your query. Try being more specific or check back later for new markets."
            )
        
        return PolyBetResponse(
            recommendations=recommendations,
            message="Here are some markets I found for you:"
        )
        
    except Exception as e:
        print(f"Error processing recommendation: {e}")
        return PolyBetResponse(
            recommendations=[],
            message="Sorry, I encountered an error while searching for markets. Please try again later."
        )

# Create protocols
chat_protocol = Protocol("Chat")
structured_protocol = Protocol("StructuredOutput")

@agent.on_event("startup")
async def startup_function(ctx: Context):
    print(f"🚀 PolyBet Market Agent starting up...")
    print(f"📍 Agent address: {agent.address}")
    print(f"🏷️  Agent name: {agent.name}")
    print(f"✅ Ready to help with betting market recommendations!")
    print(f"👀 Waiting for messages...")
    ctx.logger.info(f"PolyBet Market Agent starting up...")
    ctx.logger.info(f"Agent address: {agent.address}")
    ctx.logger.info(f"Agent name: {agent.name}")
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
@agent.on_message(model=ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """Main message handler for all ChatMessage types"""
    print(f"🔥 MESSAGE RECEIVED! From: {sender}, Text: {msg.text}, Type: {msg.type}")
    ctx.logger.info(f"🔥 MESSAGE RECEIVED! From: {sender}, Text: {msg.text}, Type: {msg.type}")
    
    # Health check
    if msg.text.lower() in ["health", "status", "ping"]:
        print(f"💚 Health check request from {sender}")
        await ctx.send(sender, ChatMessage(
            text="PolyBet Market Agent is healthy and ready to help with betting market recommendations!",
            type="status"
        ))
        return
    
    # Regular chat message handling
    print(f"🎯 Processing betting query from {sender}: {msg.text}")
    ctx.logger.info(f"Received chat message from {sender}: {msg.text}")
    
    # Rate limiting
    if not rate_limiter.is_allowed(sender):
        await ctx.send(sender, ChatMessage(
            text="Rate limit exceeded. Please try again later.",
            type="error"
        ))
        return
    
    # Extract parameters and process query
    response = process_market_recommendation(msg.text)
    
    # Format response for chat
    formatted_message = f"{response.message}\n"
    if response.recommendations:
        for i, rec in enumerate(response.recommendations[:5], 1):  # Limit to 5 results
            formatted_message += f"{i}. {rec['question']} ({rec['type']})\n"
            if rec['url'] != "#":
                formatted_message += f"   Link: {rec['url']}\n"
    
    await ctx.send(sender, ChatMessage(text=formatted_message, type="polybet_response"))
    ctx.logger.info(f"Sent {len(response.recommendations)} recommendations to {sender}")

# Include structured protocol only (chat handled directly by agent)
agent.include(structured_protocol)

if __name__ == "__main__":
    agent.run()