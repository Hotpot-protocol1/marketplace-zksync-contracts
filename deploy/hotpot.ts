import { Wallet, Provider, Contract, utils } from "zksync-web3";
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as ethers from 'ethers';

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const MNEMONIC = process.env.MNEMONIC || "";
const HOTPOT_FACTORY = process.env.HOTPOT_FACTORY || "";
const MARKETPLACE = process.env.MARKETPLACE || "";

if (!MNEMONIC)
  throw "⛔️ Private key not detected! Add it to the .env file!";
if (!HOTPOT_FACTORY)
  throw "⛔️ Specify a hotpot factory contract address in the .env file";
if (!MARKETPLACE)
  throw "⛔️ Specify a marketplace contract address in the .env file";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Creating a new Hotpot proxy with a provided factory`);

  const zkSyncProvider = new Provider("https://zksync2-testnet.zksync.dev");
  // Initialize the wallet.
  
  const walletMnemonic = Wallet.fromMnemonic(MNEMONIC);
  const pk = walletMnemonic.privateKey;
  const wallet = new Wallet(pk, zkSyncProvider);

  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("HotpotFactory");
  const factoryContract = new Contract(HOTPOT_FACTORY, artifact.abi, wallet);
 
  const txRes = await factoryContract.deployHotpot({
    potLimit: ethers.utils.parseEther("2.0"),
    raffleTicketCost: ethers.utils.parseEther("0.2"),
    claimWindow: 450000,
    numberOfWinners: 2,
    fee: 0,
    tradeFee: 1000,
    marketplace: MARKETPLACE,
    operator: MARKETPLACE // we will change it manually later
  });
  txRes.wait();

  const hotpotAddress = await factoryContract.hotpots(0);
  console.log(`Hotpot deployed to ${hotpotAddress}`);
}