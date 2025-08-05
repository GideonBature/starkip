import { Contract, CallData, RpcProvider, Account, shortString, num } from 'starknet';

// Contract configuration
export const CONTRACT_ADDRESS = '0x72f255a03b0b471ad28667fe5e9b469a8b952455ba1d58086ab385012df6c80';

// Multiple RPC endpoints for better reliability
const RPC_ENDPOINTS = [
  'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
  'https://free-rpc.nethermind.io/sepolia-juno/v0_7',
  'https://starknet-sepolia.blockpi.network/v1/rpc/public',
];

export const SEPOLIA_RPC_URL = RPC_ENDPOINTS[0];

// Contract ABI for the Starkip Tipping contract
export const CONTRACT_ABI = [
  {
    "type": "interface",
    "name": "IStarkipTipping",
    "items": [
      {
        "type": "function",
        "name": "register_creator",
        "inputs": [
          {
            "name": "creator_name",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "update_creator",
        "inputs": [
          {
            "name": "creator_name",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "record_tip",
        "inputs": [
          {
            "name": "creator_id",
            "type": "core::integer::u64"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_creator",
        "inputs": [
          {
            "name": "creator_id",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [
          {
            "type": "(core::starknet::contract_address::ContractAddress, core::felt252)"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_creator_id",
        "inputs": [
          {
            "name": "creator_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_creator_tips_total",
        "inputs": [
          {
            "name": "creator_id",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_creator_tips_count",
        "inputs": [
          {
            "name": "creator_id",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_total_creators",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      }
    ]
  }
];

// ETH token address on Starknet Sepolia
export const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';

export class StarkipContract {
  private provider: RpcProvider;
  private contract: Contract;

  constructor() {
    console.log('Initializing Starkip contract...');
    console.log('Contract address:', CONTRACT_ADDRESS);
    console.log('RPC URL:', SEPOLIA_RPC_URL);

    this.provider = new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL });
    this.contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, this.provider);

    console.log('Contract initialized successfully');
  }

  // Connect with account for write operations
  connectAccount(account: Account) {
    this.contract.connect(account);
  }

  // Creator registration
  async registerCreator(creatorName: string) {
    try {
      const nameInFelt = shortString.encodeShortString(creatorName);
      const result = await this.contract.register_creator(nameInFelt);
      await this.provider.waitForTransaction(result.transaction_hash);
      return result;
    } catch (error) {
      console.error('Error registering creator:', error);
      throw error;
    }
  }

  // Update creator name
  async updateCreator(creatorName: string) {
    try {
      const nameInFelt = shortString.encodeShortString(creatorName);
      const result = await this.contract.update_creator(nameInFelt);
      await this.provider.waitForTransaction(result.transaction_hash);
      return result;
    } catch (error) {
      console.error('Error updating creator:', error);
      throw error;
    }
  }

  // Record a tip (for analytics)
  async recordTip(creatorId: number, amount: string, tokenAddress: string = ETH_TOKEN_ADDRESS) {
    try {
      const result = await this.contract.record_tip(creatorId, amount, tokenAddress);
      await this.provider.waitForTransaction(result.transaction_hash);
      return result;
    } catch (error) {
      console.error('Error recording tip:', error);
      throw error;
    }
  }

  // Get creator info by ID
  async getCreator(creatorId: number) {
    try {
      console.log('Getting creator info for ID:', creatorId);
      const result = await this.contract.get_creator(creatorId);
      console.log('Raw creator result:', result);

      // Convert BigInt address to hex string using Starknet's num helper
      const addressBigInt = result[0];
      const addressHex = num.toHex(addressBigInt);

      const creatorData = {
        address: addressHex,
        name: shortString.decodeShortString(result[1])
      };
      console.log('Parsed creator data:', creatorData);
      return creatorData;
    } catch (error) {
      console.error('Error getting creator:', error);
      throw error;
    }
  }

  // Get creator ID by address
  async getCreatorId(creatorAddress: string) {
    try {
      console.log('Getting creator ID for address:', creatorAddress);
      const result = await this.contract.get_creator_id(creatorAddress);
      console.log('Raw creator ID result:', result);
      const creatorId = Number(result);
      console.log('Parsed creator ID:', creatorId);
      return creatorId;
    } catch (error) {
      console.error('Error getting creator ID:', error);
      throw error;
    }
  }

  // Get creator tips total
  async getCreatorTipsTotal(creatorId: number) {
    try {
      const result = await this.contract.get_creator_tips_total(creatorId);
      return result.toString();
    } catch (error) {
      console.error('Error getting creator tips total:', error);
      throw error;
    }
  }

  // Get creator tips count
  async getCreatorTipsCount(creatorId: number) {
    try {
      const result = await this.contract.get_creator_tips_count(creatorId);
      return Number(result);
    } catch (error) {
      console.error('Error getting creator tips count:', error);
      throw error;
    }
  }

  // Get total creators
  async getTotalCreators() {
    try {
      const result = await this.contract.get_total_creators();
      return Number(result);
    } catch (error) {
      console.error('Error getting total creators:', error);
      throw error;
    }
  }
}

export const starkipContract = new StarkipContract();
