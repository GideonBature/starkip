# Starkip Frontend

A React frontend for the Starkip tipping platform on Starknet.

## Features

- **Wallet Connection**: Connect your Starknet wallet (ArgentX, Braavos)
- **Creator Registration**: Register as a creator and get a unique tipping link
- **Direct Tipping**: Send ETH tips directly to creators' wallets
- **Analytics**: Track tip statistics and creator profiles
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

**Important:** Make sure you have ArgentX or Braavos wallet extension installed in your browser to test wallet functionality.

## Features

## How to Use

### For Creators

1. **Connect your wallet** using the "Connect Wallet" button
2. **Register as a creator** by entering your name
3. **Share your unique tip link** with your audience
4. **Receive tips** directly to your wallet

### For Supporters

1. **Connect your wallet** using the "Connect Wallet" button
2. **Find a creator** by entering their wallet address (0x...) or creator ID
3. **Enter tip amount** in ETH
4. **Send the tip** - it goes directly to the creator's wallet

### Creator Discovery

- **By Wallet Address**: Enter any Starknet wallet address (e.g., `0x1234...`)
- **By Creator ID**: Enter the numeric creator ID (e.g., `1`, `2`, `3`)
- **URL Links**: Share either `/tip/0x1234...` or `/tip/123` formats

## Technical Details

### Smart Contract Integration

The frontend integrates with the Starkip smart contract deployed on Starknet Sepolia:
- **Contract Address**: `0x72f255a03b0b471ad28667fe5e9b469a8b952455ba1d58086ab385012df6c80`
- **Network**: Starknet Sepolia Testnet

### Key Features

- **Direct Wallet-to-Wallet Transfers**: Tips are sent directly from tipper to creator
- **Optional Analytics**: The contract can record tip data for statistics
- **Creator Profiles**: Creators get unique IDs and shareable links
- **Real-time Updates**: UI updates automatically after transactions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Starknet.js** for blockchain interaction
- **get-starknet-core** for wallet connections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
