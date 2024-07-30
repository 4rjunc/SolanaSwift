#! /usr/bin/env node

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { program } from "commander";
import * as fs from "fs";
import * as bip39 from "bip39";
import * as figlet from "figlet"

const SOLANA_NETWORK = "https://api.devnet.solana.com";

class SolanaWallet {
  private connection: Connection;
  private keypair: Keypair;

  constructor(privateKeyPath: string) {
    this.connection = new Connection(SOLANA_NETWORK);
    const secretKeyString = fs.readFileSync(privateKeyPath, "utf8");
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    this.keypair = Keypair.fromSecretKey(secretKey);
  }

  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  async transfer(recipientAddress: string, amount: number): Promise<string> {
    const recipientPublicKey = new PublicKey(recipientAddress);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair]
    );

    return signature;
  }

  getPublicKey(): string {
    return this.keypair.publicKey.toString();
  }

  async requestAirdrop(amount: number): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      this.keypair.publicKey,
      amount * LAMPORTS_PER_SOL
    );
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  async getTransactionHistory(): Promise<any[]> {
    const signatures = await this.connection.getSignaturesForAddress(
      this.keypair.publicKey
    );
    const transactions = await Promise.all(
      signatures.map((sig) => this.connection.getTransaction(sig.signature))
    );
    return transactions;
  }
}

//Create a wallet -> the wallet details stored in wallet-secret.json 📂
function createWallet(outputPath: string): void {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const keypair = Keypair.fromSeed(seed.slice(0, 32));

  fs.writeFileSync(outputPath, JSON.stringify(Array.from(keypair.secretKey)));

  console.log(`New wallet created successfully!`);
  console.log(`Public key: ${keypair.publicKey.toString()}`);
  console.log(`Secret key saved to: ${outputPath}`);
  console.log(`Mnemonic (keep this safe!): ${mnemonic}`);
}

console.log(figlet.textSync("SolanaSwift"));

program
  .version("1.0.0")
  .description("SolanaSwift: A quick and efficient Solana wallet CLI");

program
  .command("create-wallet [output-path]")
  .description("Create a new wallet and save the secret key to a file")
  .action((outputPath = "wallet-secret.json") => {
    createWallet(outputPath);
  });

program
  .command("recover-wallet <mnemonic> [output-path]")
  .description("Recover a wallet from a mnemonic phrase")
  .action((mnemonic, outputPath = "recovered-wallet-secret.json") => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    fs.writeFileSync(outputPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(`Wallet recovered successfully!`);
    console.log(`Public key: ${keypair.publicKey.toString()}`);
    console.log(`Secret key saved to: ${outputPath}`);
  });

const walletCommands = program
  .command("wallet")
  .description("Wallet operations")
  .requiredOption(
    "-k, --key <path>",
    "Path to the JSON file containing the wallet's secret key"
  );

walletCommands
  .command("balance")
  .description("Get wallet balance")
  .action(async (options) => {
    const wallet = new SolanaWallet(walletCommands.opts().key);
    const balance = await wallet.getBalance();
    console.log(`Balance: ${balance} SOL`);
  });

walletCommands
  .command("transfer <recipient> <amount>")
  .description("Transfer SOL to another address")
  .action(async (recipient, amount) => {
    const wallet = new SolanaWallet(walletCommands.opts().key);
    try {
      const signature = await wallet.transfer(recipient, parseFloat(amount));
      console.log(`Transfer successful. Signature: ${signature}`);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  });

walletCommands
  .command("address")
  .description("Get wallet public address for receiving SOL")
  .action(() => {
    const wallet = new SolanaWallet(walletCommands.opts().key);
    console.log(`Wallet address to receive SOL: ${wallet.getPublicKey()}`);
  });

walletCommands
  .command("airdrop <amount>")
  .description("Request an airdrop of SOL tokens from devnet")
  .action(async (amount) => {
    const wallet = new SolanaWallet(walletCommands.opts().key);
    try {
      const signature = await wallet.requestAirdrop(parseFloat(amount));
      console.log(`Airdrop successful. Signature: ${signature}`);
      const balance = await wallet.getBalance();
      console.log(`New balance: ${balance} SOL`);
    } catch (error) {
      console.error("Airdrop failed:", error);
    }
  });

walletCommands
  .command("history")
  .description("Get transactions history")
  .action(async () => {
    const wallet = new SolanaWallet(walletCommands.opts().key);
    try {
      const transactions = await wallet.getTransactionHistory();
      console.log("Transaction History:");
      transactions.forEach((tx, index) => {
        console.log(`${index + 1}. Signature: ${tx.transaction.signatures[0]}`);
        console.log(`   Status: ${tx.meta?.err ? "Failed" : "Success"}`);
        console.log(
          `   Block Time: ${new Date(tx.blockTime! * 1000).toLocaleString()}`
        );
        console.log("---");
      });
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
    }
  });

program.parse(process.argv);
