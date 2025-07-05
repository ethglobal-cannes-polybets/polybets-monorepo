# Polybet

This project contains a basic polybet smart contract.

```shell
npx hardhat node
#npx hardhat ignition deploy ./ignition/modules/polybet.ts --network localhost --verify
#npx hardhat ignition deploy ./ignition/modules/polybet.ts --network sapphiretestnet --verify

# To deploy the contract, run the following which deploys, verifies, and updates hardcoded contract addresses across the product
./deploy-full.sh

# If you need to manually deploy, but always prefer the deploy-full.sh script
npx hardhat run scripts/deploy.ts --network sapphiretestnet

# To dump the marketplaces on the Oasis contract

# Bets against trump divorce market on {marketplaceId: 2 (slaughterhouse), marketId: 124} and {marketplaceId: 3 (terminal), marketId: 118}
npx hardhat run scripts/placeBet.ts --network sapphiretestnet 
```
