import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, TrendingUp } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import CreatorRegistration from '../components/CreatorRegistration';
import TipCreator from '../components/TipCreator';
import ErrorBoundary from '../components/ErrorBoundary';
import { starkipContract } from '../utils/contract';

const HomePage: React.FC = () => {
  const { creatorAddress } = useParams<{ creatorAddress: string }>();
  const [totalCreators, setTotalCreators] = useState(0);
  const [userCreatorId, setUserCreatorId] = useState<number | null>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [targetCreatorId, setTargetCreatorId] = useState<number | undefined>(undefined);
  const { address, isConnected } = useWallet();

  const loadStats = async () => {
    try {
      const total = await starkipContract.getTotalCreators();
      setTotalCreators(total);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkUserRegistration = async () => {
    if (!address || !isConnected) return;

    setIsCheckingRegistration(true);
    try {
      const creatorId = await starkipContract.getCreatorId(address);
      setUserCreatorId(creatorId > 0 ? creatorId : null);
    } catch (error) {
      console.error('Error checking registration:', error);
      setUserCreatorId(null);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleRegistrationSuccess = () => {
    checkUserRegistration();
    loadStats();
  };

  // Effect to resolve creator address to ID when URL has an address
  useEffect(() => {
    const resolveCreatorAddress = async () => {
      if (creatorAddress) {
        try {
          if (creatorAddress.startsWith('0x')) {
            // It's a wallet address, get the creator ID
            const id = await starkipContract.getCreatorId(creatorAddress);
            if (id > 0) {
              setTargetCreatorId(id);
            }
          } else {
            // It's a numeric ID
            const id = parseInt(creatorAddress);
            if (!isNaN(id) && id > 0) {
              setTargetCreatorId(id);
            }
          }
        } catch (error) {
          console.error('Error resolving creator address:', error);
        }
      }
    };

    resolveCreatorAddress();
  }, [creatorAddress]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    checkUserRegistration();
  }, [address, isConnected]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Starkip
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          The decentralized tipping platform on Starknet
        </p>
        <div className="flex justify-center space-x-8 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Creators</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{totalCreators}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Creator Registration or User Info */}
        <div>
          {isConnected ? (
            <>
              {isCheckingRegistration ? (
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Checking registration...</p>
                </div>
              ) : userCreatorId ? (
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Your Creator Profile</h2>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Creator ID:</span> {userCreatorId}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Your Tip Link (by address):</span>
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-sm break-all">
                      {window.location.origin}/tip/{address}
                    </div>
                    <p className="text-gray-600">
                      <span className="font-medium">Your Tip Link (by ID):</span>
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-sm break-all">
                      {window.location.origin}/tip/{userCreatorId}
                    </div>
                    <p className="text-xs text-gray-500">
                      💡 Share either link - people can tip using your wallet address or creator ID!
                    </p>
                  </div>
                </div>
              ) : (
                <CreatorRegistration onRegistrationSuccess={handleRegistrationSuccess} />
              )}
            </>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Started</h2>
              <p className="text-gray-600 mb-4">
                Connect your Starknet wallet (ArgentX or Braavos) to register as a creator or start tipping creators.
              </p>
              <div className="text-sm text-gray-500">
                <p className="mb-2">🔗 <strong>Contract Address:</strong></p>
                <p className="break-all bg-gray-50 p-2 rounded text-xs">
                  0x72f255a03b0b471ad28667fe5e9b469a8b952455ba1d58086ab385012df6c80
                </p>
                <p className="mt-2">📡 <strong>Network:</strong> Starknet Sepolia</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Tip Creator */}
        <div>
          <ErrorBoundary>
            <TipCreator creatorId={targetCreatorId} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          How Starkip Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Register</h3>
            <p className="text-gray-600">
              Connect your wallet and register as a creator. You'll get both a numeric ID and can use your wallet address.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share</h3>
            <p className="text-gray-600">
              Share your wallet address or tip link. People can tip you using either your address (0x...) or creator ID.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Receive</h3>
            <p className="text-gray-600">
              Get tips sent directly to your wallet. No intermediaries - just peer-to-peer transfers on Starknet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
