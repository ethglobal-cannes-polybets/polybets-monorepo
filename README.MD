
# Live app is here: https://polybets-web3.vercel.app/

# Project contents

## Apps

[bet-router-rofl](./apps/bet-router-rofl): The service that takes a bet from Oasis and routes it to external prediction markets. Also the service that handles cancellations, selling position, and returning winnings back to users among other management tasks. This is an Oasis ROFL app hosted on Oasis ROFL infra,privacy and trustlessness is table stakes.
[knowledge-graph](./apps/knowledge-graph): Loaders for getting our knowledge into Graph Protocol's Knowledge Graph for use in market discovery and bet slip formation.
[market-discovery-agent](./apps/market-discovery-agent): Searches our internal knowledge base and public Knowledge Graph for markets that align with something the user wants to bet on to help them form bet slips of equivalent markets on different platforms.
[polymarket-copier](./apps/polymarket-copier): Used to copy and rephrase Polymarket data to bootstrap new markets against existing prediction market deployments on Solana.
[marketplace-adapter-rest-api](./apps/marketplace-adapter-rest-api): A REST API that allows us to integrate with external prediction markets.
[contracts](./contracts): Oasis contracts that are used to privately track and manage bets placed over multiple prediction markets. Primarily upkept by the bet-router-rofl app.

## Libraries:
[common](./common): Common libraries used across the project, esp. contains the external marketplace adapters and generic interfaces we use to integrate with outside prediction markets.
[migrations](./packages/migrations): Migrations we ran to seed our internal knowledge base.


## Dead code
[arbitrage-rofl](./apps/arbitrage-rofl): IGNORE THIS - package was initialized, should be ignored. The arbitrage logic was placed in the bet-router-rofl and the Oasis contract.