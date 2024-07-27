# SolanaSwift 🚀

SolanaSwift is a quick and efficient Solana wallet CLI tool for managing Solana transactions on the devnet.

## Features 🌟

- Create new wallets
- Check wallet balance
- Transfer SOL between wallets
- Request airdrops (on devnet)
- Get wallet address for receiving SOL

## Installation 🛠️

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/SolanaSwift.git
   cd SolanaSwift
   ```

2. Install dependencies:
   ```
   bun install
   ```

## Usage 📘

### Create a New Wallet 🆕

Create a new wallet and save the secret key to a file:

```
bun run solana-wallet.ts create-wallet [output-path]
```

- `[output-path]`: Optional. Path to save the wallet secret key (default: `wallet-secret.json`)

### Wallet Operations 💼

All wallet operations require the `-k` option to specify the path to your wallet's secret key file.

#### Check Balance 💰

Get the balance of your wallet:

```
bun run solana-wallet.ts wallet -k <path-to-secret-key> balance
```

#### Transfer SOL 💸

Transfer SOL to another address:

```
bun run solana-wallet.ts wallet -k <path-to-secret-key> transfer <recipient-address> <amount>
```

- `<recipient-address>`: The public key of the recipient's wallet
- `<amount>`: The amount of SOL to transfer

#### Get Wallet Address 📫

Display the public address of your wallet:

```
bun run solana-wallet.ts wallet -k <path-to-secret-key> address
```

#### Request Airdrop 🪂

Request an airdrop of SOL tokens from the devnet faucet:

```
bun run solana-wallet.ts wallet -k <path-to-secret-key> airdrop <amount>
```

- `<amount>`: The amount of SOL to request (subject to devnet limitations)

## Important Notes ⚠️

- This tool connects to the Solana devnet by default.
- Devnet SOL tokens have no real-world value and are for testing purposes only.
- Airdrop functionality is limited by devnet restrictions on amount and frequency.

## Contributing 🤝

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/yourusername/solanaswift/issues).

## License 📄

[MIT](https://choosealicense.com/licenses/mit/)

## Show your support ⭐

Give a ⭐️ if this project helped you!

This project was created using `bun init` in bun v1.1.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
