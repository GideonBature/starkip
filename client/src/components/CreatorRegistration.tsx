import React, { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { starkipContract } from '../utils/contract';

interface CreatorRegistrationProps {
  onRegistrationSuccess: () => void;
}

const CreatorRegistration: React.FC<CreatorRegistrationProps> = ({ onRegistrationSuccess }) => {
  const [creatorName, setCreatorName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const { account, isConnected } = useWallet();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!creatorName.trim()) {
      setError('Please enter a creator name');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      starkipContract.connectAccount(account as any);
      await starkipContract.registerCreator(creatorName.trim());
      onRegistrationSuccess();
      setCreatorName('');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register creator. You may already be registered.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Register as Creator</h2>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 mb-1">
            Creator Name
          </label>
          <input
            type="text"
            id="creatorName"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="Enter your creator name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRegistering}
            maxLength={31} // Felt252 limitation for short strings
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum 31 characters
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isRegistering || !isConnected}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
        >
          {isRegistering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            <span>Register as Creator</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatorRegistration;
