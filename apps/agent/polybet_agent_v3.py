import os
import time
import requests
import random
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

# Track shown markets per user to avoid repetition
user_shown_markets = {}

# Debug environment variables
print(f"🔧 Environment check:")
print(f"   Supabase URL: {'✅ Set' if supabase_url else '❌ Missing'}")
print(f"   Supabase Key: {'✅ Set' if supabase_key else '❌ Missing'}")
print(f"   OpenAI Key: {'✅ Set' if openai.api_key else '❌ Missing'}")

# Supabase REST API headers - only create if we have the key
supabase_headers = {}
if supabase_key:
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

def test_supabase_connection() -> bool:
    """Test Supabase connection and return True if successful"""
    try:
        if not supabase_url or not supabase_key:
            print("❌ Cannot test connection - missing Supabase configuration")
            return False
        
        # Test with a simple query
        url = f"{supabase_url}/rest/v1/"
        response = requests.get(url, headers=supabase_headers, timeout=5)
        
        if response.status_code == 200:
            print("✅ Supabase connection successful")
            return True
        else:
            print(f"❌ Supabase connection failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Supabase connection test failed: {e}")
        return False

def get_markets_from_supabase() -> List[Dict[str, Any]]:
    """Fetch all markets from Supabase using REST API"""
    try:
        if not supabase_url or not supabase_key:
            print("❌ Supabase configuration missing - URL or key not set")
            return []
        
        url = f"{supabase_url}/rest/v1/markets"
        print(f"🔍 Fetching markets from: {url}")
        
        response = requests.get(url, headers=supabase_headers, timeout=10)
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 401:
            print("❌ Authentication failed - check SUPABASE_SERVICE_KEY")
            return []
        elif response.status_code == 404:
            print("❌ Markets table not found - check table name")
            return []
        
        response.raise_for_status()
        data = response.json()
        print(f"📈 Found {len(data)} markets")
        
        # Validate data structure
        if not isinstance(data, list):
            print(f"⚠️ Unexpected data format: expected list, got {type(data)}")
            return []
        
        # Debug: show sample market structure
        if data and len(data) > 0:
            sample_market = data[0]
            print(f"🔍 Sample market keys: {list(sample_market.keys())}")
        
        return data
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error fetching markets: {e}")
        return []
    except ValueError as e:
        print(f"❌ JSON parsing error fetching markets: {e}")
        return []
    except Exception as e:
        print(f"❌ Unexpected error fetching markets: {e}")
        return []

def get_external_markets_from_supabase() -> List[Dict[str, Any]]:
    """Fetch all external markets with marketplace info from Supabase using REST API"""
    try:
        if not supabase_url or not supabase_key:
            print("❌ Supabase configuration missing - URL or key not set")
            return []
        
        url = f"{supabase_url}/rest/v1/external_markets"
        params = {
            "select": "*,marketplaces(name,chain_name,chain_family)"
        }
        print(f"🔍 Fetching external markets from: {url}")
        print(f"🔍 Query params: {params}")
        
        response = requests.get(url, headers=supabase_headers, params=params, timeout=10)
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 401:
            print("❌ Authentication failed - check SUPABASE_SERVICE_KEY")
            return []
        elif response.status_code == 404:
            print("❌ External markets table not found - check table name")
            return []
        
        response.raise_for_status()
        data = response.json()
        print(f"📈 Found {len(data)} external markets")
        
        # Validate data structure
        if not isinstance(data, list):
            print(f"⚠️ Unexpected data format: expected list, got {type(data)}")
            return []
        
        # Debug: show sample external market structure
        if data and len(data) > 0:
            sample_market = data[0]
            print(f"🔍 Sample external market keys: {list(sample_market.keys())}")
            if 'marketplaces' in sample_market:
                print(f"🔍 Marketplace data: {sample_market['marketplaces']}")
        
        return data
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error fetching external markets: {e}")
        return []
    except ValueError as e:
        print(f"❌ JSON parsing error fetching external markets: {e}")
        return []
    except Exception as e:
        print(f"❌ Unexpected error fetching external markets: {e}")
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
        User query: "{user_query}"
        
        The user is asking for betting market recommendations. If they're asking for general recommendations like "provide one", "recommend one", "suggest markets", or "show me something to bet on", you should return ALL available markets.
        
        Here are available {market_type} markets:
        {chr(10).join(market_descriptions)}
        
        Rules:
        - If user asks for general recommendations/suggestions without specific topics, return ALL market IDs
        - If user mentions specific topics (like "Trump", "sports", "crypto"), return only relevant markets
        - Return market IDs separated by commas, or "ALL" for general recommendations
        - Only return "NONE" if the user clearly wants something unrelated to betting
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
        print(f"🤖 LLM filtering result for '{user_query}': {result}")
        
        if result == "NONE":
            return []
        elif result == "ALL":
            print(f"🎯 Returning all {len(markets)} {market_type} markets for general recommendation")
            return markets
        
        # Parse the result and filter markets
        relevant_ids = [int(id.strip()) for id in result.split(",") if id.strip().isdigit()]
        filtered_markets = [market for market in markets if market['id'] in relevant_ids]
        print(f"🎯 Filtered to {len(filtered_markets)} {market_type} markets")
        
        return filtered_markets
        
    except Exception as e:
        print(f"Error filtering markets with LLM: {e}")
        return []

def is_market_related_query(user_query: str) -> bool:
    """Check if user query is related to betting markets using LLM"""
    try:
        # Quick checks for obvious greetings/non-market queries
        greeting_words = ["hello", "hi", "hola", "hey", "good morning", "good afternoon", "good evening"]
        simple_greetings = ["thanks", "thank you", "bye", "goodbye"]
        
        query_lower = user_query.lower().strip()
        
        # If it's just a greeting or very short non-market text
        if (query_lower in greeting_words or 
            query_lower in simple_greetings or 
            len(query_lower) < 3 or
            query_lower in ["yes", "no", "ok", "okay"]):
            return False
        
        # Check for market-related keywords that indicate betting intent
        market_keywords = [
            "recommend", "invest", "bet", "market", "prediction", "odds", "one", "show me", 
            "give me", "find", "suggest", "what", "which", "how much", "price", "outcome",
            "sports", "politics", "crypto", "bitcoin", "trump", "election", "win", "lose"
        ]
        
        # If query contains market-related keywords, it's likely market-related
        if any(keyword in query_lower for keyword in market_keywords):
            return True
        
        # Use LLM for more complex cases
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """Determine if the user's message is asking about betting markets, predictions, wants recommendations, or investment advice. 
                Return only 'YES' if it's market-related (including requests for recommendations, suggestions, or investment advice), 
                'NO' if it's only a greeting, general conversation, or completely unrelated question."""},
                {"role": "user", "content": user_query}
            ],
            max_tokens=10,
            temperature=0.1
        )
        
        result = response.choices[0].message.content.strip().upper()
        return result == "YES"
        
    except Exception as e:
        print(f"Error checking market relevance: {e}")
        # If LLM fails, assume it's market-related to avoid blocking legitimate queries
        return True

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

def filter_unseen_markets(markets: List[Dict[str, Any]], user_id: str) -> List[Dict[str, Any]]:
    """Filter out markets that have already been shown to this user"""
    if user_id not in user_shown_markets:
        user_shown_markets[user_id] = set()
    
    shown_ids = user_shown_markets[user_id]
    unseen_markets = [market for market in markets if market.get('id') not in shown_ids]
    
    # If all markets have been shown, reset the user's history and show all markets
    if not unseen_markets and markets:
        print(f"🔄 Resetting shown markets for user {user_id} - all markets have been seen")
        user_shown_markets[user_id] = set()
        unseen_markets = markets
    
    return unseen_markets

def track_shown_markets(markets: List[Dict[str, Any]], user_id: str):
    """Track which markets were shown to this user"""
    if user_id not in user_shown_markets:
        user_shown_markets[user_id] = set()
    
    for market in markets:
        if 'id' in market:
            user_shown_markets[user_id].add(market['id'])

def process_market_recommendation(user_query: str, user_id: str = "default") -> PolyBetResponse:
    """Process market recommendation request"""
    try:
        print(f"🔍 Processing query: {user_query}")
        
        # Step 0: Check if query is market-related
        if not is_market_related_query(user_query):
            return PolyBetResponse(
                recommendations=[],
                message="👋 Hello! I'm here to help you find betting markets. Please ask me about specific topics you'd like to bet on, such as:\n• Sports events or outcomes\n• Political predictions\n• Cryptocurrency prices\n• Entertainment predictions\n\nExample: 'Show me markets about Bitcoin price' or 'What sports betting markets are available?'"
            )
        
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
        
        # Step 2: Filter out markets already shown to this user
        fresh_internal = filter_unseen_markets(internal_markets, user_id)
        fresh_external = filter_unseen_markets(external_markets, user_id)
        
        print(f"🆕 Fresh markets - Internal: {len(fresh_internal)}, External: {len(fresh_external)}")
        
        # Step 3: Filter markets using LLM based on user query
        relevant_internal = filter_markets_with_llm(user_query, fresh_internal, "internal")
        relevant_external = filter_markets_with_llm(user_query, fresh_external, "external")
        
        print(f"🎯 Relevant markets found - Internal: {len(relevant_internal)}, External: {len(relevant_external)}")
        
        # Check if user wants only one recommendation
        wants_single = any(phrase in user_query.lower() for phrase in ["only one", "just one", "provide one", "give me one", "single", "one recommendation"])
        limit = 1 if wants_single else 5
        
        # Randomize market order for variety
        if relevant_internal:
            random.shuffle(relevant_internal)
        if relevant_external:
            random.shuffle(relevant_external)
        
        recommendations = []
        
        # Add relevant internal markets
        for market in relevant_internal[:limit]:
            recommendations.append({
                "question": market.get("common_question", "Unknown question"),
                "url": market.get("url") or "#",
                "type": "PolyBets Platform",
                "options": ", ".join(market.get("options", []) if market.get("options") else [])
            })
        
        # Add relevant external markets (only if we haven't reached the limit)
        remaining_slots = limit - len(recommendations)
        for market in relevant_external[:remaining_slots]:
            marketplace_name = market.get("marketplaces", {}).get("name", "Unknown") if market.get("marketplaces") else "Unknown"
            recommendations.append({
                "question": market.get("question", "Unknown question"),
                "url": market.get("url") or "#",
                "type": f"External - {marketplace_name}",
                "options": "Variable"
            })
        
        # If no relevant markets found, fall back to general recommendations
        if not recommendations:
            # Shuffle markets for variety and show random selection
            all_markets = internal_markets + external_markets
            if all_markets:
                random.shuffle(all_markets)
                fallback_count = limit if wants_single else 4
                fallback_markets = all_markets[:fallback_count]
            else:
                fallback_markets = []
            for market in fallback_markets:
                if market in internal_markets:
                    recommendations.append({
                        "question": market.get("common_question", "Unknown question"),
                        "url": market.get("url") or "#",
                        "type": "PolyBets Platform",
                        "options": ", ".join(market.get("options", []) if market.get("options") else [])
                    })
                else:
                    marketplace_name = market.get("marketplaces", {}).get("name", "Unknown") if market.get("marketplaces") else "Unknown"
                    recommendations.append({
                        "question": market.get("question", "Unknown question"),
                        "url": market.get("url") or "#",
                        "type": f"External - {marketplace_name}",
                        "options": "Variable"
                    })
            
            message = f"No markets directly matched your query '{user_query}'. Here are some general betting markets:"
        else:
            if wants_single:
                message = f"Here's a betting market recommendation for you:"
            else:
                message = f"Here are betting markets relevant to your query '{user_query}':"
        
        # Track which markets were shown to this user
        markets_to_track = []
        if relevant_internal:
            markets_to_track.extend(relevant_internal[:limit])
        if relevant_external:
            remaining_slots = limit - len(relevant_internal[:limit])
            markets_to_track.extend(relevant_external[:remaining_slots])
        if not recommendations and fallback_markets:
            markets_to_track.extend(fallback_markets)
        
        track_shown_markets(markets_to_track, user_id)
        print(f"📝 Tracked {len(markets_to_track)} markets for user {user_id}")
        
        return PolyBetResponse(
            recommendations=recommendations,
            message=message
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
    
    # Test Supabase connection
    print("🔌 Testing Supabase connection...")
    if test_supabase_connection():
        # Test data fetching
        print("📊 Testing data fetching...")
        internal_markets = get_markets_from_supabase()
        external_markets = get_external_markets_from_supabase()
        print(f"✅ Data test complete - Internal: {len(internal_markets)}, External: {len(external_markets)}")
    
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
    response = process_market_recommendation(msg.query, sender)
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
    polybet_response = process_market_recommendation(text_content, sender)
    
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