# Starkip Tipping Contract Deployment

This repository contains the deployment script for the Starkip Tipping smart contract built with Cairo and Starknet.

## Contract Overview

The `StarkipTipping` contract provides:
- Creator registration with unique IDs
- Tip recording and analytics
- Event emission for all major actions
- Direct wallet-to-wallet tip tracking

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **Starknet Account** with sufficient ETH for gas fees
3. **Compiled Contract** (run `scarb build` first)

### Important: Contract Artifacts

The deployment script uses the **compiled contract class** (`.contract_class.json`), which includes both:
- **Sierra code** (Cairo intermediate representation)
- **CASM code** (Cairo Assembly for execution)

Make sure your `Scarb.toml` has the correct configuration:
```toml
[[target.starknet-contract]]
casm = true    # Required for deployment
sierra = true  # Required for deployment
```

After running `scarb build`, you should see files like:
- `target/dev/starkip_StarkipTipping.contract_class.json` ✅ (Used for deployment)
- `target/dev/starkip_StarkipTipping.sierra.json` (Sierra only)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your account details
```

## Configuration

Edit the `.env` file with your account information:

```env
STARKNET_ACCOUNT_ADDRESS=0x...  # Your Starknet account address
STARKNET_PRIVATE_KEY=0x...      # Your account private key
STARKNET_NETWORK=testnet        # testnet or mainnet
```

## Deployment

### Option 1: Full Deployment (Build + Deploy)
```bash
npm run deploy:full
```

### Option 2: Deploy Only
```bash
npm run deploy
```

### Option 3: Deploy to Specific Network
```bash
# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet
```

### Option 4: Deploy with Usage Demo
```bash
npm run deploy:demo
```

## Manual Deployment

You can also run the deployment script directly:

```bash
# Using environment variables
STARKNET_ACCOUNT_ADDRESS=0x123... STARKNET_PRIVATE_KEY=0x456... node deploy.js

# With help
node deploy.js --help
```

## Contract Functions

After deployment, your contract will have the following functions:

### Creator Management
- `register_creator(creator_name: felt252)` - Register as a creator
- `update_creator(creator_name: felt252)` - Update creator information
- `get_creator(creator_id: u64)` - Get creator details
- `get_creator_id(creator_address: ContractAddress)` - Get creator ID by address
- `get_total_creators()` - Get total number of registered creators

### Tip Tracking
- `record_tip(creator_id: u64, amount: u256, token_address: ContractAddress)` - Record a tip transaction
- `get_creator_tips_total(creator_id: u64)` - Get total tips received by creator
- `get_creator_tips_count(creator_id: u64)` - Get number of tips received by creator

## Events

The contract emits the following events:
- `CreatorRegistered` - When a new creator registers
- `CreatorUpdated` - When creator information is updated
- `TipRecorded` - When a tip is recorded

## Output

After successful deployment, you'll get:
- Contract address
- Class hash
- Transaction hash
- `deployment.json` file with all deployment details

## Troubleshooting

### Common Issues

1. **"Contract artifact not found"**
   - Run `scarb build` first to compile the contract

2. **"Insufficient account balance"**
   - Ensure your account has enough ETH for gas fees

3. **"Contract already declared"**
   - This is normal, the script will extract the existing class hash

4. **"Invalid private key"**
   - Ensure your private key is correctly formatted (starts with 0x)

### Debug Mode

For more detailed logging, you can modify the script or add console logs as needed.

## Security

⚠️ **Never commit your `.env` file or expose your private keys!**

- Keep your private keys secure
- Use testnet for testing
- Verify all transactions before confirming

## License

This project is licensed under the MIT License.
