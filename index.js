#!/usr/bin/env ts-node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var commander_1 = require("commander");
var fs = require("fs");
var bip39 = require("bip39");
var SOLANA_NETWORK = "https://api.devnet.solana.com";
var SolanaWallet = /** @class */ (function () {
    function SolanaWallet(privateKeyPath) {
        this.connection = new web3_js_1.Connection(SOLANA_NETWORK);
        var secretKeyString = fs.readFileSync(privateKeyPath, "utf8");
        var secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        this.keypair = web3_js_1.Keypair.fromSecretKey(secretKey);
    }
    SolanaWallet.prototype.getBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.getBalance(this.keypair.publicKey)];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, balance / web3_js_1.LAMPORTS_PER_SOL];
                }
            });
        });
    };
    SolanaWallet.prototype.transfer = function (recipientAddress, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var recipientPublicKey, transaction, signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recipientPublicKey = new web3_js_1.PublicKey(recipientAddress);
                        transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                            fromPubkey: this.keypair.publicKey,
                            toPubkey: recipientPublicKey,
                            lamports: amount * web3_js_1.LAMPORTS_PER_SOL,
                        }));
                        return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [this.keypair])];
                    case 1:
                        signature = _a.sent();
                        return [2 /*return*/, signature];
                }
            });
        });
    };
    SolanaWallet.prototype.getPublicKey = function () {
        return this.keypair.publicKey.toString();
    };
    SolanaWallet.prototype.requestAirdrop = function (amount) {
        return __awaiter(this, void 0, void 0, function () {
            var signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.requestAirdrop(this.keypair.publicKey, amount * web3_js_1.LAMPORTS_PER_SOL)];
                    case 1:
                        signature = _a.sent();
                        return [4 /*yield*/, this.connection.confirmTransaction(signature)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, signature];
                }
            });
        });
    };
    SolanaWallet.prototype.getTransactionHistory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signatures, transactions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.getSignaturesForAddress(this.keypair.publicKey)];
                    case 1:
                        signatures = _a.sent();
                        return [4 /*yield*/, Promise.all(signatures.map(function (sig) { return _this.connection.getTransaction(sig.signature); }))];
                    case 2:
                        transactions = _a.sent();
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    return SolanaWallet;
}());
//Create a wallet -> the wallet details stored in wallet-secret.json 📂
function createWallet(outputPath) {
    var mnemonic = bip39.generateMnemonic();
    var seed = bip39.mnemonicToSeedSync(mnemonic);
    var keypair = web3_js_1.Keypair.fromSeed(seed.slice(0, 32));
    fs.writeFileSync(outputPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log("New wallet created successfully!");
    console.log("Public key: ".concat(keypair.publicKey.toString()));
    console.log("Secret key saved to: ".concat(outputPath));
    console.log("Mnemonic (keep this safe!): ".concat(mnemonic));
}
commander_1.program
    .version("1.0.0")
    .description("SolanaSwift: A quick and efficient Solana wallet CLI");
commander_1.program
    .command("create-wallet [output-path]")
    .description("Create a new wallet and save the secret key to a file")
    .action(function (outputPath) {
    if (outputPath === void 0) { outputPath = "wallet-secret.json"; }
    createWallet(outputPath);
});
commander_1.program
    .command("recover-wallet <mnemonic> [output-path]")
    .description("Recover a wallet from a mnemonic phrase")
    .action(function (mnemonic, outputPath) {
    if (outputPath === void 0) { outputPath = "recovered-wallet-secret.json"; }
    var seed = bip39.mnemonicToSeedSync(mnemonic);
    var keypair = web3_js_1.Keypair.fromSeed(seed.slice(0, 32));
    fs.writeFileSync(outputPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log("Wallet recovered successfully!");
    console.log("Public key: ".concat(keypair.publicKey.toString()));
    console.log("Secret key saved to: ".concat(outputPath));
});
var walletCommands = commander_1.program
    .command("wallet")
    .description("Wallet operations")
    .requiredOption("-k, --key <path>", "Path to the JSON file containing the wallet's secret key");
walletCommands
    .command("balance")
    .description("Get wallet balance")
    .action(function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, balance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = new SolanaWallet(walletCommands.opts().key);
                return [4 /*yield*/, wallet.getBalance()];
            case 1:
                balance = _a.sent();
                console.log("Balance: ".concat(balance, " SOL"));
                return [2 /*return*/];
        }
    });
}); });
walletCommands
    .command("transfer <recipient> <amount>")
    .description("Transfer SOL to another address")
    .action(function (recipient, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, signature, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = new SolanaWallet(walletCommands.opts().key);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, wallet.transfer(recipient, parseFloat(amount))];
            case 2:
                signature = _a.sent();
                console.log("Transfer successful. Signature: ".concat(signature));
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("Transfer failed:", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
walletCommands
    .command("address")
    .description("Get wallet public address for receiving SOL")
    .action(function () {
    var wallet = new SolanaWallet(walletCommands.opts().key);
    console.log("Wallet address to receive SOL: ".concat(wallet.getPublicKey()));
});
walletCommands
    .command("airdrop <amount>")
    .description("Request an airdrop of SOL tokens from devnet")
    .action(function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, signature, balance, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = new SolanaWallet(walletCommands.opts().key);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, wallet.requestAirdrop(parseFloat(amount))];
            case 2:
                signature = _a.sent();
                console.log("Airdrop successful. Signature: ".concat(signature));
                return [4 /*yield*/, wallet.getBalance()];
            case 3:
                balance = _a.sent();
                console.log("New balance: ".concat(balance, " SOL"));
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error("Airdrop failed:", error_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
walletCommands
    .command("history")
    .description("Get transactions history")
    .action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, transactions, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = new SolanaWallet(walletCommands.opts().key);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, wallet.getTransactionHistory()];
            case 2:
                transactions = _a.sent();
                console.log("Transaction History:");
                transactions.forEach(function (tx, index) {
                    var _a;
                    console.log("".concat(index + 1, ". Signature: ").concat(tx.transaction.signatures[0]));
                    console.log("   Status: ".concat(((_a = tx.meta) === null || _a === void 0 ? void 0 : _a.err) ? "Failed" : "Success"));
                    console.log("   Block Time: ".concat(new Date(tx.blockTime * 1000).toLocaleString()));
                    console.log("---");
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error("Failed to fetch transaction history:", error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
commander_1.program.parse(process.argv);
