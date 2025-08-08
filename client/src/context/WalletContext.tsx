import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AccountInterface } from 'starknet';

interface WalletContextType {
  account: AccountInterface | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      // Check if starknet wallet is available in window
      if (typeof window !== 'undefined' && (window as any).starknet) {
        const starknet = (window as any).starknet;
        await starknet.enable();

        if (starknet.isConnected) {
          setAccount(starknet.account);
          setAddress(starknet.selectedAddress);
          setIsConnected(true);
        }
      } else {
        throw new Error('No Starknet wallet detected. Please install ArgentX or Braavos.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure you have ArgentX or Braavos installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setAddress(null);
    setIsConnected(false);
  };

  const value: WalletContextType = {
    account,
    address,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
