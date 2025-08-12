import React, { createContext, useContext, useState, ReactNode } from 'react';
import argentxLogo from '../assets/argentx.png';
import braavosLogo from '../assets/braavos.png';
import { AccountInterface } from 'starknet';


export interface DetectedWallet {
  id: string;
  name: string;
  icon?: string;
  provider: any;
}

interface WalletContextType {
  account: AccountInterface | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  availableWallets: DetectedWallet[];
  connectWallet: (walletId?: string) => Promise<void>;
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
  const [availableWallets, setAvailableWallets] = useState<DetectedWallet[]>([]);

  // Detect wallets on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const wallets: DetectedWallet[] = [];
    // ArgentX
    if ((window as any).starknet_argentX) {
      wallets.push({
        id: 'argentX',
        name: 'ArgentX',
        icon: argentxLogo,
        provider: (window as any).starknet_argentX,
      });
    }
    // Braavos
    if ((window as any).starknet_braavos) {
      wallets.push({
        id: 'braavos',
        name: 'Braavos',
        icon: braavosLogo,
        provider: (window as any).starknet_braavos,
      });
    }
    // Standard (fallback, e.g. only one wallet injected as window.starknet)
    if ((window as any).starknet && wallets.length === 0) {
      wallets.push({
        id: 'default',
        name: 'Starknet Wallet',
        provider: (window as any).starknet,
      });
    }
    setAvailableWallets(wallets);
  }, []);

  const connectWallet = async (walletId?: string) => {
    try {
      setIsConnecting(true);
      let wallet: DetectedWallet | undefined;
      if (walletId) {
        wallet = availableWallets.find(w => w.id === walletId);
      } else {
        wallet = availableWallets[0];
      }
      if (!wallet) throw new Error('No Starknet wallet detected. Please install ArgentX or Braavos.');
      const provider = wallet.provider;
      await provider.enable();
      if (provider.isConnected) {
        setAccount(provider.account);
        setAddress(provider.selectedAddress);
        setIsConnected(true);
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
    availableWallets,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
