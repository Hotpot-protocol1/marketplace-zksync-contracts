import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const MNEMONIC = process.env.MNEMONIC || "";
const HOTPOT_IMPLEMENTATION = process.env.HOTPOT_IMPLEMENTATION || "";

if (!MNEMONIC)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Factory`);

  // Initialize the wallet.
  const wallet = Wallet.fromMnemonic(MNEMONIC);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("HotpotFactory");

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(artifact, [HOTPOT_IMPLEMENTATION]);

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const factoryContract = await deployer.deploy(artifact, [HOTPOT_IMPLEMENTATION]);

  // Show the contract info.
  const contractAddress = factoryContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // verify contract for tesnet & mainnet
  if (process.env.NODE_ENV != "test") {
    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const contractFullyQualifedName = "contracts/HotpotFactory.sol:HotpotFactory";

    // Verify contract programmatically
    const verificationId = await hre.run("verify:verify", {
      address: contractAddress,
      contract: contractFullyQualifedName,
      constructorArguments: [HOTPOT_IMPLEMENTATION],
      bytecode: artifact.bytecode,
    });
  } else {
    console.log(`Contract not verified, deployed locally.`);
  }
}