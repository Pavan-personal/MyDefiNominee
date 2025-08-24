# Demo


<img width="670" height="3280" alt="screencapture-localhost-3000-nominee-2025-08-25-03_05_33" src="https://github.com/user-attachments/assets/a9613934-df78-4ba4-a775-9a18855f23f0" />
<img width="670" height="956" alt="Screenshot 2025-08-25 at 2 53 13 AM" src="https://github.com/user-attachments/assets/f96bfbc4-6c56-45e2-a1b1-adafe41764cf" />
<img width="670" height="2082" alt="screencapture-localhost-3000-nominee-2025-08-25-03_03_52" src="https://github.com/user-attachments/assets/abd9d152-f9ce-42c1-943b-449758ec9ca3" />
<img width="670" height="956" alt="Screenshot 2025-08-25 at 2 53 29 AM" src="https://github.com/user-attachments/assets/d8083f64-cfb0-4726-b188-1f81b99a9ea4" />

# Blocklock Frontend Kit

A Next.js web application for time-locked encryption using blockchain technology. This kit allows users to encrypt messages that can only be decrypted after a specified time period using the Blocklock protocol.

## 🌟 Features

- **Time-locked Encryption**: Encrypt messages that automatically decrypt at a future date
- **Multi-chain Support**: Compatible with multiple blockchain networks including Filecoin, Base, Arbitrum, and Optimism
- **Wallet Integration**: Connect with popular crypto wallets via RainbowKit
- **Explorer Interface**: View and track your encrypted messages and decryption status
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.0.0
- A crypto wallet (MetaMask, etc.)
- Network connection to supported blockchains

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blocklock-frontend-kit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.0 with React 18
- **Styling**: Tailwind CSS
- **Wallet Connection**: RainbowKit + Wagmi
- **Blockchain Integration**: Ethers.js + Blocklock.js
- **State Management**: React Query (@tanstack/react-query)
- **Icons**: Lucide React + React Icons
- **TypeScript**: Full type safety

## 🔧 Supported Networks

- **Filecoin Mainnet** (Chain ID: 314)
- **Filecoin Calibration** (Chain ID: 314159)  
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Optimism Sepolia** (Chain ID: 11155420)
- **Base Sepolia** (Chain ID: 84532)

## 🔒 How It Works

1. **Connect Wallet**: Connect your crypto wallet to the application
2. **Enter Message**: Type the message you want to encrypt
3. **Set Time**: Choose when the message should be decryptable
4. **Encrypt**: The app calculates the target block height and encrypts your message
5. **Explorer**: View your encrypted messages and their decryption status

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── blocklock/         # Main encryption interface
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── useEncrypt.ts      # Encryption logic
│   ├── useEthers.ts       # Ethers.js integration
│   ├── useExplorer.ts     # Message explorer functionality
│   └── useNetworkConfig.ts # Network configurations
├── lib/                   # Utilities and configurations
│   └── contract.ts        # Smart contract ABIs and addresses
└── public/                # Static assets
```

## 🔗 Smart Contract Integration

The app interacts with deployed Blocklock smart contracts on various networks. Each contract handles:

- Time-locked encryption requests
- Callback gas limit calculations
- Message storage and retrieval
- Decryption key management

## 🎨 UI Components

- **Landing Page**: Introduction and navigation to encryption tool
- **Blocklock Interface**: Main encryption/decryption interface with tabs
- **Explorer**: View encrypted messages with block numbers and status
- **Wallet Connection**: RainbowKit integration for wallet management

## 📝 Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## 🤝 Contributing

This is a starter kit for building time-locked encryption applications. Feel free to fork and extend it for your needs.

## 📄 License

Built with ❤️ by FIL-B & Pavan

## 🔗 Links

- [Documentation](https://docs.randa.mu/)
- [GitHub](https://github.com/randa-mu)
- [Twitter](https://x.com/RandamuInc/)
