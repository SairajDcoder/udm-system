import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import dotenv from "dotenv";

const { fileURLToPath } = await import('url');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the root project .env
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

async function main() {
  // Use Alchemy Sepolia if configured, otherwise fall back to local Hardhat
  const rpcUrl = process.env.ALCHEMY_SEPOLIA_URL || "http://127.0.0.1:8545";
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(privateKey, provider);

  console.log("🔗 RPC:", rpcUrl.includes("alchemy") ? "Alchemy Sepolia (Cloud)" : "Local Hardhat");
  console.log("📤 Deploying with account:", deployer.address);

  const balance = await provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Wallet has no ETH! Get some from https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
    process.exit(1);
  }

  // Deploy AuditLogger
  let auditArtifact;
  try {
     auditArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/AuditLogger.sol/AuditLogger.json"), "utf8"));
  } catch (e) {
     console.error("Artifact not found! Run: npx hardhat compile");
     process.exit(1);
  }
  
  const AuditLoggerFactory = new ethers.ContractFactory(auditArtifact.abi, auditArtifact.bytecode, deployer);
  console.log("⏳ Deploying AuditLogger...");
  const auditLogger = await AuditLoggerFactory.deploy();
  await auditLogger.waitForDeployment();
  const auditLoggerAddress = await auditLogger.getAddress();
  console.log("✅ AuditLogger deployed to:", auditLoggerAddress);

  // Deploy DIDRegistry
  const didArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/DIDRegistry.sol/DIDRegistry.json"), "utf8"));
  const DIDRegistryFactory = new ethers.ContractFactory(didArtifact.abi, didArtifact.bytecode, deployer);
  console.log("⏳ Deploying DIDRegistry...");
  const didRegistry = await DIDRegistryFactory.deploy();
  await didRegistry.waitForDeployment();
  const didRegistryAddress = await didRegistry.getAddress();
  console.log("✅ DIDRegistry deployed to:", didRegistryAddress);

  // Save the addresses
  const addrs = {
    AuditLogger: auditLoggerAddress,
    DIDRegistry: didRegistryAddress
  };

  const p = path.join(__dirname, "..", "..", ".data", "contract-addresses.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(addrs, null, 2));
  console.log("📁 Addresses saved to", p);
  console.log("");
  console.log("👉 Now paste this into your .env file:");
  console.log(`   AUDIT_LOGGER_CONTRACT_ADDRESS=${auditLoggerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
