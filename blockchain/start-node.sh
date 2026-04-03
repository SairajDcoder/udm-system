#!/bin/bash
npx hardhat node > hardhat-node.log 2>&1 &
sleep 4
node scripts/deploy-raw.js
