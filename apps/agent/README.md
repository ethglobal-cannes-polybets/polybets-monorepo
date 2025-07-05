# PolyBet Market Recommendation Agent

An ASI-compatible uAgent that provides intelligent betting market recommendations by analyzing user queries and matching them with relevant markets from both PolyBets platform and external marketplaces.

## Features

🎯 **Smart Market Matching**: Uses OpenAI GPT-3.5-turbo to intelligently match user queries with relevant betting markets

📊 **Multi-Source Data**: Searches both internal PolyBets markets and external marketplace data

🔄 **ASI:one Compatible**: Built as a mailbox agent for seamless integration with ASI:one platform

⚡ **Rate Limited**: Implements 30 requests/hour rate limiting for sustainable usage

🛡️ **Health Monitoring**: Built-in health checks and status monitoring

## Supported Market Types

- Sports betting markets
- Cryptocurrency prediction markets  
- Political election markets
- Weather/climate markets
- Financial markets
- Custom prediction markets

## Usage

### Natural Language Queries
Send a chat message with your betting interest:
- "I want to bet on the next US election"
- "Show me crypto markets for Bitcoin price"
- "Any sports betting markets for football?"

### Structured Queries
Send structured queries with specific parameters for more targeted results.

### Health Check
Send "health", "status", or "ping" to check agent status.

## Response Format

The agent returns:
- Market question/description
- Market type (PolyBets Platform or External marketplace)
- Direct links to markets when available
- Available betting options

## Technical Details

- **Framework**: uAgents with mailbox functionality
- **AI Integration**: OpenAI GPT-3.5-turbo for query processing
- **Database**: Supabase for market data storage
- **Rate Limiting**: 30 requests/hour per user
- **Protocols**: Chat Protocol, Structured Output Protocol

## Agent Address

The agent can be found and interacted with through ASI:one platform using its unique agent address.

## Data Sources

- **Internal Markets**: PolyBets platform markets with Yes/No options
- **External Markets**: Integrated marketplaces including:
  - Polymarket (Orderbook)
  - Limitless (Orderbook) 
  - Custom LMSR markets

## Error Handling

- Graceful handling of database connection issues
- LLM API error recovery
- Rate limiting with user-friendly messages
- Comprehensive logging for debugging

---

*This agent is designed to help users discover relevant betting opportunities across multiple platforms through intelligent query processing and market matching.*