import fs from "fs";
import path from "path";
import { ethers } from "ethers";

const { fileURLToPath } = await import('url');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  // Hardhat's default 1st and 2nd accounts:
  const deployer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy AuditLogger
  let auditArtifact;
  try {
     auditArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/AuditLogger.sol/AuditLogger.json"), "utf8"));
  } catch (e) {
     console.error("Artifact not found! Did you compile?");
     process.exit(1);
  }
  
  const AuditLoggerFactory = new ethers.ContractFactory(auditArtifact.abi, auditArtifact.bytecode, deployer);
  const auditLogger = await AuditLoggerFactory.deploy();
  await auditLogger.waitForDeployment();
  const auditLoggerAddress = await auditLogger.getAddress();
  console.log("AuditLogger deployed to:", auditLoggerAddress);

  // Deploy DIDRegistry
  const didArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/DIDRegistry.sol/DIDRegistry.json"), "utf8"));
  const DIDRegistryFactory = new ethers.ContractFactory(didArtifact.abi, didArtifact.bytecode, deployer);
  const didRegistry = await DIDRegistryFactory.deploy();
  await didRegistry.waitForDeployment();
  const didRegistryAddress = await didRegistry.getAddress();
  console.log("DIDRegistry deployed to:", didRegistryAddress);

  // Save the addresses back to the Next.js backend!
  const addrs = {
    AuditLogger: auditLoggerAddress,
    DIDRegistry: didRegistryAddress
  };

  const p = path.join(__dirname, "..", "..", ".data", "contract-addresses.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(addrs, null, 2));
  console.log("Addresses saved to", p);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
