import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy AuditLogger
  const AuditLogger = await hre.ethers.getContractFactory("AuditLogger");
  const auditLogger = await AuditLogger.deploy();
  await auditLogger.waitForDeployment();
  const auditLoggerAddress = await auditLogger.getAddress();
  console.log("AuditLogger deployed to:", auditLoggerAddress);

  // Deploy DIDRegistry
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
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
