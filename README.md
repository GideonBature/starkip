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
git clone [your_repo_url]
cd [your_repo_name]
````

Install dependencies:

```bash
npm install
# or
yarn install
```

Start the development server:

```bash
npm run dev
# or
yarn dev
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

## 💡 How to Use

### For Creators:

1. Go to the **Creator Dashboard** and connect your Starknet wallet.
2. A unique tipping link is generated for you.
3. Share this link on your social media or website.
4. Tips go directly to your wallet.

### For Tippers:

1. Click a creator's tipping link.
2. The dApp loads with the creator's address pre-filled.
3. Connect your Starknet wallet.
4. Enter a tip amount and confirm the transaction.

Done! Your tip is on its way. 💸

---

## 📞 Support and Contact

For questions or issues, feel free to:

* [Open an issue](https://github.com/your-repo/issues)
* Reach out to the project maintainers.

---

> **Built with love for creators and crypto by the community.**
