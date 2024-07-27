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

  async airDrop(amount: number): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      this.keypair.publicKey,
      LAMPORTS_PER_SOL
    );
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
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
}

//Create a wallet -> the wallet details stored in wallet-secret.json 📂
function createWallet(outputPath: string): void {
  const newWallet = Keypair.generate();
  const secretKey = Array.from(newWallet.secretKey);

  fs.writeFileSync(outputPath, JSON.stringify(secretKey));

  console.log(`New wallet created successfully!`);
  console.log(`Public key: ${newWallet.publicKey.toString()}`);
  console.log(`Secret key saved to: ${outputPath}`);
}

program
  .version("1.0.0")
  .description("SolanaSwift: A quick and efficient Solana wallet CLI");

program
  .command("create-wallet [output-path]")
  .description("Create a new wallet and save the secret key to a file")
  .action((outputPath = "wallet-secret.json") => {
    createWallet(outputPath);
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

program.parse(process.argv);
