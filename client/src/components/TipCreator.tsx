import React, { useState, useEffect } from 'react';
import { Heart, Loader2, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { starkipContract, ETH_TOKEN_ADDRESS } from '../utils/contract';

interface Creator {
  id: number;
  address: string; // This should always be a hex string now
  name: string;
  tipsTotal: string;
  tipsCount: number;
}

interface TipCreatorProps {
  creatorId?: number;
}

const TipCreator: React.FC<TipCreatorProps> = ({ creatorId }) => {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recordOnChain, setRecordOnChain] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [searchId, setSearchId] = useState(creatorId?.toString() || '');
  const { account, isConnected } = useWallet();

  const loadCreator = async (id: number) => {
    try {
      console.log('Loading creator with ID:', id);

      if (!id || id <= 0) {
        throw new Error('Invalid creator ID');
      }

      const creatorData = await starkipContract.getCreator(id);
      console.log('Creator data:', creatorData);

      if (!creatorData.address || creatorData.address === '0x0' || creatorData.address === '0x00') {
        throw new Error('Creator not found');
      }

      const tipsTotal = await starkipContract.getCreatorTipsTotal(id);
      const tipsCount = await starkipContract.getCreatorTipsCount(id);

      setCreator({
        id,
        address: creatorData.address,
        name: creatorData.name,
        tipsTotal,
        tipsCount
      });

      console.log('Creator loaded successfully:', { id, address: creatorData.address, name: creatorData.name });
    } catch (err) {
      console.error('Error loading creator:', err);
      setError(`Creator not found: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a creator address or ID');
      return;
    }

    setIsSearching(true);
    setError('');
    setCreator(null); // Clear previous creator

    try {
      console.log('Searching for:', searchId);
      let creatorId: number;

      // Check if input is a wallet address (starts with 0x)
      if (searchId.startsWith('0x')) {
        console.log('Searching by wallet address:', searchId);
        // Search by wallet address
        creatorId = await starkipContract.getCreatorId(searchId);
        console.log('Found creator ID:', creatorId);

        if (creatorId === 0) {
          setError('No creator found with this wallet address');
          return;
        }
      } else {
        // Search by numeric ID
        console.log('Searching by numeric ID:', searchId);
        creatorId = parseInt(searchId);
        if (isNaN(creatorId) || creatorId <= 0) {
          setError('Please enter a valid creator ID or wallet address');
          return;
        }
      }

      console.log('Loading creator with ID:', creatorId);
      await loadCreator(creatorId);
    } catch (err) {
      console.error('Error searching creator:', err);
      setError(`Error searching creator: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const sendTip = async () => {
    if (!account || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!creator) {
      setError('Please select a creator first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid tip amount');
      return;
    }

    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      // Send ETH directly to creator's address
      const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString();

      console.log('Sending tip:', {
        to: creator.address,
        amount: amountInWei,
        amountETH: amount
      });

      // Use account.execute to send ETH
      const call = {
        contractAddress: ETH_TOKEN_ADDRESS,
        entrypoint: 'transfer',
        calldata: [creator.address, amountInWei, '0']
      };

      console.log('Executing transaction...');
      const result = await account.execute(call);
      console.log('Transaction submitted:', result.transaction_hash);

      setTransactionHash(result.transaction_hash);
      setSuccess(`Transaction submitted! Hash: ${result.transaction_hash}`);

      // Transaction submitted successfully, show immediate success
      // Don't wait for confirmation due to RPC endpoint issues
      setSuccess(`Successfully sent ${amount} ETH! Transaction: ${result.transaction_hash}`);

      // Optionally record the tip for analytics if user requested it
      if (recordOnChain) {
        setIsRecording(true);
        try {
          if (account) {
            console.log('Recording tip on-chain...');
            starkipContract.connectAccount(account as any);
            await starkipContract.recordTip(creator.id, amountInWei, ETH_TOKEN_ADDRESS);
            console.log('Tip recorded on-chain successfully');
          }
        } catch (recordError) {
          console.error('Error recording tip on-chain (tip was still sent):', recordError);
          // Don't show error to user since the main tip went through
        } finally {
          setIsRecording(false);
        }
      }

      // Always try to refresh creator stats (this is just a read operation)
      try {
        await loadCreator(creator.id);
        console.log('Creator stats refreshed');
      } catch (refreshError) {
        console.error('Error refreshing creator stats:', refreshError);
      }

      setAmount('');
    } catch (err: any) {
      console.error('Error sending tip:', err);
      setError(err.message || 'Failed to send tip');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (creatorId) {
      console.log('Auto-loading creator with ID:', creatorId);
      loadCreator(creatorId);
    }
  }, [creatorId]);

  // Test function to check if contract is working
  const testContract = async () => {
    try {
      console.log('Testing contract connection...');
      const totalCreators = await starkipContract.getTotalCreators();
      console.log('Total creators:', totalCreators);
      setSuccess(`Contract connected! Total creators: ${totalCreators}`);
    } catch (error) {
      console.error('Contract test failed:', error);
      setError(`Contract test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Heart className="h-6 w-6 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">Tip a Creator</h2>
      </div>

      {!creator && (
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="creatorAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Creator Address or ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="creatorAddress"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter wallet address or creator ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={testContract}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
              >
                Test
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You can enter either a wallet address (0x...) or a numeric creator ID
            </p>
          </div>
        </div>
      )}

      {creator && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">{creator.name}</h3>
            <p className="text-sm text-gray-600">ID: {creator.id}</p>
            <p className="text-sm text-gray-600">
              Address: {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
            </p>
            <div className="mt-2 text-sm">
              <p className="text-gray-600">
                Total Tips: {(parseFloat(creator.tipsTotal) / Math.pow(10, 18)).toFixed(4)} ETH
              </p>
              <p className="text-gray-600">Tip Count: {creator.tipsCount}</p>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Tip Amount (ETH)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              step="0.001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSending}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recordOnChain"
              checked={recordOnChain}
              onChange={(e) => setRecordOnChain(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="recordOnChain" className="text-sm text-gray-600">
              Record tip on-chain for analytics (requires extra gas)
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
              <div className="break-words">{success}</div>
              {transactionHash && (
                <div className="mt-1">
                  <a
                    href={`https://sepolia.starkscan.co/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-xs break-all"
                  >
                    View on Starkscan ↗
                  </a>
                </div>
              )}
              {isRecording && (
                <div className="mt-1 flex items-center space-x-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Refreshing creator stats...</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={sendTip}
            disabled={isSending || !isConnected || !amount}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium rounded-md transition-colors"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Tip...</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                <span>Send Tip</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TipCreator;
