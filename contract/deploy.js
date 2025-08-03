// scripts/deploy.js
import { Account, RpcProvider, hash, CallData, stark } from 'starknet';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  network: 'sepolia',
  nodeUrl: process.env.SEPOLIA_NODE_URL || 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY,
  deployerAddress: process.env.DEPLOYER_ADDRESS,
  contractName: 'StarkipTipping',
  packageName: 'starkip'
};

async function validateEnvironment() {
  const missing = [];

  if (!CONFIG.deployerPrivateKey) missing.push('DEPLOYER_PRIVATE_KEY');
  if (!CONFIG.deployerAddress) missing.push('DEPLOYER_ADDRESS');

  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}\nPlease check your .env file`);
  }

  console.log('✅ Environment validation passed');
}

async function loadContractArtifacts() {
  try {
    console.log('📂 Loading contract artifacts...');

    const sierraPath = `./target/dev/${CONFIG.packageName}_${CONFIG.contractName}.contract_class.json`;
    const casmPath = `./target/dev/${CONFIG.packageName}_${CONFIG.contractName}.compiled_contract_class.json`;

    const sierra = JSON.parse(await fs.readFile(sierraPath, 'utf-8'));
    const casm = JSON.parse(await fs.readFile(casmPath, 'utf-8'));

    console.log('✅ Contract artifacts loaded successfully');
    return { sierra, casm };

  } catch (error) {
    throw new Error(`❌ Failed to load contract artifacts: ${error.message}\nMake sure you run 'scarb build' first`);
  }
}

async function setupProvider() {
  console.log(`🌐 Connecting to Starknet ${CONFIG.network}...`);
  console.log(`📡 RPC URL: ${CONFIG.nodeUrl}`);

  const provider = new RpcProvider({
    nodeUrl: CONFIG.nodeUrl
  });

  // Test connection
  try {
    await provider.getChainId();
    console.log('✅ Successfully connected to Starknet');
  } catch (error) {
    throw new Error(`❌ Failed to connect to Starknet: ${error.message}`);
  }

  return provider;
}

async function setupAccount(provider) {
  console.log(`👤 Setting up deployer account: ${CONFIG.deployerAddress}`);

  const account = new Account(provider, CONFIG.deployerAddress, CONFIG.deployerPrivateKey);

  // Verify account exists and has balance
  try {
    const balance = await account.getBalance();
    console.log(`💰 Account balance: ${balance} WEI`);

    if (BigInt(balance) === 0n) {
      console.warn('⚠️  Warning: Account has zero balance. Make sure it has ETH for gas fees.');
    }
  } catch (error) {
    console.warn(`⚠️  Could not fetch account balance: ${error.message}`);
  }

  return account;
}

async function declareContract(account, sierra, casm) {
  const classHash = hash.computeContractClassHash(sierra);
  console.log(`🔍 Computed class hash: ${classHash}`);

  // Check if already declared
  try {
    await account.provider.getClass(classHash);
    console.log('✅ Contract class already declared, skipping declaration');
    return { class_hash: classHash, transaction_hash: null };
  } catch (error) {
    // Contract not declared, proceed with declaration
  }

  console.log('📝 Declaring contract class...');

  try {
    const declareResult = await account.declare({
      contract: sierra,
      casm: casm
    });

    console.log(`⏳ Declaration transaction submitted: ${declareResult.transaction_hash}`);
    console.log('⏳ Waiting for transaction confirmation...');

    const receipt = await account.waitForTransaction(declareResult.transaction_hash);

    if (receipt.isSuccess()) {
      console.log('✅ Contract declared successfully');
      return declareResult;
    } else {
      throw new Error(`Declaration transaction failed: ${receipt.transaction_failure_reason}`);
    }

  } catch (error) {
    throw new Error(`❌ Declaration failed: ${error.message}`);
  }
}

async function deployContract(account, classHash) {
  console.log('🚀 Deploying contract instance...');

  // Timelock contract has no constructor parameters
  const constructorCalldata = CallData.compile([]);

  try {
    const deployResult = await account.deployContract({
      classHash: classHash,
      constructorCalldata: constructorCalldata
    });

    console.log(`⏳ Deployment transaction submitted: ${deployResult.transaction_hash}`);
    console.log('⏳ Waiting for transaction confirmation...');

    const receipt = await account.waitForTransaction(deployResult.transaction_hash);

    if (receipt.isSuccess()) {
      console.log('✅ Contract deployed successfully');
      return deployResult;
    } else {
      throw new Error(`Deployment transaction failed: ${receipt.transaction_failure_reason}`);
    }

  } catch (error) {
    throw new Error(`❌ Deployment failed: ${error.message}`);
  }
}

async function saveDeploymentInfo(classHash, contractAddress, deploymentTx) {
  const deploymentInfo = {
    network: CONFIG.network,
    timestamp: new Date().toISOString(),
    contractName: CONFIG.contractName,
    classHash: classHash,
    contractAddress: contractAddress,
    deploymentTransaction: deploymentTx,
    explorerUrl: `https://sepolia.starkscan.co/contract/${contractAddress}`
  };

  const deploymentPath = './deployments.json';

  try {
    let deployments = {};
    try {
      const existing = await fs.readFile(deploymentPath, 'utf-8');
      deployments = JSON.parse(existing);
    } catch (error) {
      // File doesn't exist, start fresh
    }

    if (!deployments[CONFIG.network]) {
      deployments[CONFIG.network] = {};
    }

    deployments[CONFIG.network][CONFIG.contractName] = deploymentInfo;

    await fs.writeFile(deploymentPath, JSON.stringify(deployments, null, 2));
    console.log(`📄 Deployment info saved to ${deploymentPath}`);

  } catch (error) {
    console.warn(`⚠️  Could not save deployment info: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting Starknet deployment process...\n');

  try {
    // Validate environment
    await validateEnvironment();

    // Load contract artifacts
    const { sierra, casm } = await loadContractArtifacts();

    // Setup provider and account
    const provider = await setupProvider();
    const account = await setupAccount(provider);

    // Declare contract
    const declareResult = await declareContract(account, sierra, casm);

    // Deploy contract
    const deployResult = await deployContract(account, declareResult.class_hash);

    // Save deployment information
    await saveDeploymentInfo(
      declareResult.class_hash,
      deployResult.contract_address,
      deployResult.transaction_hash
    );

    // Success summary
    console.log('\n🎉 Deployment completed successfully!');
    console.log('═'.repeat(60));
    console.log(`📄 Contract Name: ${CONFIG.contractName}`);
    console.log(`🏠 Contract Address: ${deployResult.contract_address}`);
    console.log(`🔍 Class Hash: ${declareResult.class_hash}`);
    console.log(`🌐 Network: ${CONFIG.network}`);
    console.log(`🔗 Explorer: https://sepolia.starkscan.co/contract/${deployResult.contract_address}`);
    console.log('═'.repeat(60));

    console.log('\n💡 Next steps:');
    console.log(`1. Add CONTRACT_ADDRESS=${deployResult.contract_address} to your .env file`);
    console.log('2. Run "npm run interact" to test contract interactions');
    console.log('3. Visit the explorer link above to view your contract');

  } catch (error) {
    console.error('\n💥 Deployment failed!');
    console.error(`Error: ${error.message}`);

    // Provide helpful troubleshooting tips
    console.log('\n🔧 Troubleshooting tips:');
    console.log('• Make sure you have run "scarb build" to compile the contract');
    console.log('• Verify your .env file has correct DEPLOYER_PRIVATE_KEY and DEPLOYER_ADDRESS');
    console.log('• Ensure your deployer account has sufficient ETH balance');
    console.log('• Check if your RPC endpoint is working correctly');

    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});

// Run deployment
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
