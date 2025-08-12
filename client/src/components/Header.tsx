import React, { useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import starknetLogo from '../assets/starknet-logo.svg';

const Header: React.FC = () => {
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting, availableWallets } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img
              src={starknetLogo}
              alt="Starknet logo"
              className="h-8 w-8 mr-2"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Starkip</h1>
              <span className="text-xs text-gray-500">Tip creators on Starknet</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {formatAddress(address!)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <LogOut size={16} />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowWalletModal(true)}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
                >
                  <Wallet size={16} />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
                {showWalletModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowWalletModal(false)}
                        aria-label="Close"
                      >
                        ×
                      </button>
                      <h2 className="text-lg font-semibold mb-4 text-gray-900">Select a Wallet</h2>
                      {availableWallets.length === 0 && (
                        <div className="text-gray-500">No Starknet wallets detected.<br/>Please install ArgentX or Braavos.</div>
                      )}
                      <div className="flex flex-col gap-3">
                        {availableWallets.map(wallet => (
                          <button
                            key={wallet.id}
                            onClick={async () => {
                              setShowWalletModal(false);
                              await connectWallet(wallet.id);
                            }}
                            className="flex items-center gap-3 px-4 py-2 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                            disabled={isConnecting}
                          >
                            {wallet.icon && (
                              <img src={wallet.icon} alt={wallet.name} className="h-6 w-6" />
                            )}
                            <span className="text-gray-900 font-medium">{wallet.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
