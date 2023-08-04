import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "@matterlabs/hardhat-zksync-upgradable";
require('dotenv').config();

const {
  ZKSYNC_ERA_API
} = process.env;

// dynamically changes endpoints for local tests
const zkSyncTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      }
    : {
        url: "https://zksync2-testnet.zksync.dev",
        ethNetwork: "goerli",
        zksync: true,
        // contract verification endpoint
        verifyURL:
          "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
      };

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		},
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
			forking: {
				url: ZKSYNC_ERA_API ? ZKSYNC_ERA_API : '',
				blockNumber: 10165918,
			},
      zksync: true,
    },
    zkSyncTestnet
  },
  solidity: {
    version: "0.8.19",
  },

};

export default config;
