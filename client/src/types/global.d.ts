declare global {
  interface Window {
    starknet?: {
      enable: () => Promise<string[]>;
      isConnected: boolean;
      account: any;
      selectedAddress: string;
      chainId: string;
    };
  }
}

export {};
