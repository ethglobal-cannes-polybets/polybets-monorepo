# Setup

## Oasis setup:
```shell
curl -L -o oasis_cli_0.14.1_darwin_all.tar.gz https://github.com/oasisprotocol/cli/releases/download/v0.14.1/oasis_cli_0.14.1_darwin_all.tar.g
tar -xzf oasis_cli_0.14.1_darwin_all.tar.gz
sudo mv oasis_cli_0.14.1_darwin_all/oasis /usr/local/bin/
rm -rf oasis_cli_0.14.1_darwin_all.tar.gz oasis_cli_0.14.1_darwin_all/

oasis wallet import ethglobal_cannes
? Kind: private key
? Algorithm: secp256k1-raw
? Private key (hex-encoded): [Enter 2 empty lines to finish]
<PUT PRIVATE KEY HERE>




? Private key (hex-encoded): 
<PUT PRIVATE KEY HERE>
? Choose a new passphrase: 
? Repeat passphrase: 
~/p/polybets-monorepo/a/bet-rou
```

## Docker setup:
Create a personal access token (classic) on github, read:packages, write:packages, delete:packages for permissions. Set a short expiry date since lol-whats-opsec-brosis-we-only-have-32-hours-to-build-this
``` shell
docker login ghcr.io -u ad0ll
<provide PAT in pass>
docker image build -t ghcr.io/ethglobal-cannes-polybets/bet-router-rofl .;
```

## Docker image push:
```shell
docker push ghcr.io/ethglobal-cannes-polybets/bet-router-rofl
```

## Local setup:
```shell
poetry install
poetry run python main.py
```