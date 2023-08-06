import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet, Contract, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const MNEMONIC = process.env.MNEMONIC || "";
const HOTPOT_FACTORY = process.env.HOTPOT_FACTORY || "";
const MARKETPLACE = process.env.MARKETPLACE || "";
const BEACON = process.env.BEACON || "";

if (!MNEMONIC)
  throw "⛔️ Private key not detected! Add it to the .env file!";
if (!HOTPOT_FACTORY)
  throw "⛔️ Specify a hotpot factory contract address in the .env file";
if (!MARKETPLACE)
  throw "⛔️ Specify a marketplace contract address in the .env file";
if (!BEACON)
  throw "⛔️ Specify a beacon contract address in the .env file";

export default async function(hre: HardhatRuntimeEnvironment) {
  const contractName = "Hotpot";
  console.log("Deploying " + contractName + "...");
  // Initialize the wallet.
  const wallet = Wallet.fromMnemonic(MNEMONIC);
  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);

  const hotpotContract = await deployer.loadArtifact(contractName);
  const beaconContract = await deployer.loadArtifact("UpgradeableBeacon");
  const beacon = new Contract(BEACON, beaconContract.abi, wallet);

  /* Encoding arguments */
  const initParams = {
    potLimit: ethers.utils.parseEther("2.0"),
    raffleTicketCost: ethers.utils.parseEther("0.2"),
    claimWindow: 450000,
    numberOfWinners: 2,
    fee: 0,
    tradeFee: 1000,
    marketplace: MARKETPLACE,
    operator: MARKETPLACE // we will change it manually later
  };
  
  const hotpotOwner = wallet.address;
  const initializeArgs = [hotpotOwner, Object.values(initParams)];

  const hotpot = await hre.zkUpgrades.deployBeaconProxy(
    deployer.zkWallet, beacon, hotpotContract, initializeArgs
  );
  await hotpot.deployed();
  console.log(contractName + " beacon proxy deployed to: ", hotpot.address);
}
