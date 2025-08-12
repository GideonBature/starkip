# Starkip (Onchain) ☕

This is a decentralized application (dApp) built on the **Starknet** network that allows supporters to send tips directly to creators. The entire tipping process—from sending funds to recording the transaction—is handled on-chain.

This project provides a **seamless**, **secure**, and **transparent** way for creators to monetize their work and for fans to show appreciation.

---

## 🚀 Features

- **Dynamic Tipping Link**
  Creators receive a unique, shareable link that automatically pre-populates their Starknet address in the tipping form.

- **Direct Wallet-to-Contract Interaction**
  Tippers can connect their Starknet wallet and send a custom tip amount directly to the smart contract.

- **On-chain Transparency**
  All tips are transactions on the Starknet blockchain, ensuring a verifiable and transparent record of all financial support.

- **Creator Dashboard**
  A simple interface for creators to connect their wallet and generate their personalized tipping link.

- **No Traditional Backend**
  The core functionality of the dApp is handled by the Starknet smart contract, eliminating the need for a centralized server.

---

## 🛠️ Technical Stack

### Smart Contract:
- **Cairo-lang**: Programming language for Starknet smart contracts.
- **Starknet Testnet**: For deploying and testing the contract.

### Frontend:
- **Scaffold-Stark**: Full-stack Starknet framework, includes a Next.js frontend.
- **starknet.js**: JS library to interact with Starknet from the browser.
- **Next.js**: React-based framework for building UI.

---

## 📋 Prerequisites

Before running the project, make sure you have:

- A Starknet-compatible browser wallet (e.g., Argent X or Braavos)
- Node.js (v18 or higher)
- npm or Yarn
- A code editor like VS Code (with [Cairo 1 extension](https://marketplace.visualstudio.com/items?itemName=starkware.cairo1))

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/GideonBature/starkip.git
cd starkip
````

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the running dApp.

---

## 📝 Smart Contract Details

The smart contract is the **core** of this dApp. It receives tips and forwards them to the correct recipient.

* **Contract Name**: `TippingContract.cairo` (or similar)
* **Key Function**: `tip_creator`
* **Arguments**:

  * `creator_address: felt252`
* **Logic**:

  * The function receives a transaction with an attached amount of ETH.
  * It uses Starknet system calls to forward the exact amount to the `creator_address`.
  * The contract does **not** hold funds; it acts as a transparent, secure escrow that forwards payments immediately.

---

## 💻 Frontend Details

The frontend handles all interactions with the contract and displays a clean, simple UI.

### Creator Dashboard Page (`/dashboard`):

* When a creator connects their wallet, the app reads their Starknet address.
* It constructs a URL like:
  `https://yourdapp.com/tip?creator_address=YOUR_STARKNET_ADDRESS`
* This link is displayed with a "Copy" button.

### Tipping Page (`/tip`):

* The app parses the URL and extracts `creator_address`.
* It displays this address (possibly truncated).
* The user inputs a tip amount.
* Clicking "Tip" triggers the `tip_creator` function, sending ETH on-chain.

---





## 💡 How to Use the Application

> **Note:**
> - Starkip is currently deployed only on the Starknet Sepolia (testnet) network. Please ensure your wallet (ArgentX or Braavos) is connected to Sepolia. Mainnet deployment is not yet available for general use.
> - The public is free to use Starkip as they wish for testing and experimentation.
> - You will need both Sepolia ETH (to send tips) and Sepolia STRK (for gas fees) in your wallet to use all features.
> - If you encounter any errors or have suggestions for improvement, please [open an issue on the project GitHub](https://github.com/starkip/issues).

Starkip is designed to be simple for both creators and tippers. Here’s how it works for each:

### For Creators

1. Visit the application: https://starkip-fhqj.vercel.app/
2. Connect your Starknet wallet (ArgentX or Braavos).
3. Register as a creator. Once registered, your dashboard will display two unique tipping links:
  - One with your wallet address (e.g., `/tip/0x...`)
  - One with your creator ID (e.g., `/tip/1`)
  Both links work for receiving tips.
4. Share your tipping link anywhere—on social media, your website, or any channel where your supporters can find it.
5. Tips go directly to your wallet, and you can track your stats on the dashboard.

### For Tippers

1. Click a creator’s tipping link. The page will load showing the creator’s name, their ID, and their wallet address (with only the first 4 and last 4 digits visible for privacy).
2. Connect your Starknet wallet if you haven’t already.
3. Enter the amount you wish to tip (currently in ETH).
4. Click “Send Tip” to send your support. You can also choose to record the tip onchain for analytics and transparency (this will require a small extra gas fee in addition to the normal transaction fee).
5. Confirm the transaction in your wallet. That’s it—the creator receives your support directly, and you can be sure it’s on-chain and transparent!

**Summary:**
- Creators: Register, get your link, and share it. Tips go straight to your wallet.
- Tippers: Click a link, connect your wallet, enter an amount, and tip—optionally recording the tip onchain for extra transparency.

---

## 📞 Support and Contact

For questions or issues, feel free to:

* [Open an issue](https://github.com/starkip/issues)
* Reach out to the project maintainers.

---

> **Built with love for creators and users in general in the Starknet community.**
