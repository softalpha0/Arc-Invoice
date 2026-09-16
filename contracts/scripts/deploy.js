const hre = require("hardhat");

async function main() {
  const InvoiceEscrow = await hre.ethers.getContractFactory("InvoiceEscrow");
  const invoiceEscrow = await InvoiceEscrow.deploy();
  await invoiceEscrow.waitForDeployment();

  const address = await invoiceEscrow.getAddress();
  console.log(`InvoiceEscrow deployed to: ${address}`);
  console.log(`Network: ${hre.network.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
