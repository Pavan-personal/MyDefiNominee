"use client";
import { useNominee } from "@/hooks/useNominee";
import "@/lib/unlockService"; // Import unlock service for background unlock detection
import { Tab } from "@headlessui/react";
import {
    XMarkIcon, ClockIcon, UserGroupIcon, DocumentTextIcon,
    ShieldCheckIcon, DocumentIcon, PhotoIcon, FilmIcon, ArchiveBoxIcon,
    LockClosedIcon, KeyIcon, GlobeAltIcon, SparklesIcon, CalendarIcon, ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { SunIcon, MoonIcon, WalletIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function NomineePage() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [showWalletMenu, setShowWalletMenu] = useState(false);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Copy to clipboard with cool effect
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000); // Hide after 2 seconds
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed: ', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    };

    // Apply dark mode to body
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Close wallet menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showWalletMenu && !(event.target as Element).closest('.wallet-menu-container')) {
                setShowWalletMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showWalletMenu]);

    const {
        description, setDescription, nominees,
        unlockDate, setUnlockDate, removeNominee, updateNominee,
        createNomineeRequest, selectedFile, handleFileSelect, removeSelectedFile,
        myFileAssets, myNomineeFileAssets, userAddress, isValid, formatFileSize
    } = useNominee();

    // Get locked vaults from the hook
    const { vaultsSummary } = useNominee();
    const lockedVaults = vaultsSummary?.vaults_shared_with_me?.locked || [];

    const allFileAssets = [...myFileAssets, ...myNomineeFileAssets];

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return PhotoIcon;
        if (fileType.startsWith('video/')) return FilmIcon;
        if (fileType.startsWith('application/')) return DocumentIcon;
        return ArchiveBoxIcon;
    };

    // Landing page when wallet not connected
    if (!userAddress) {
        return (
            <div className={clsx("min-h-screen overflow-hidden", isDarkMode ? "bg-gray-900" : "bg-white")}>
                {/* Subtle fixed background pattern */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className={clsx("absolute -top-40 -right-40 w-80 h-80 rounded-full animate-pulse", isDarkMode ? "bg-white opacity-10" : "bg-black opacity-5")}></div>
                    <div className={clsx("absolute -bottom-40 -left-40 w-96 h-96 rounded-full animate-pulse delay-1000", isDarkMode ? "bg-white opacity-10" : "bg-black opacity-5")}></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
                    {/* Dark Mode Toggle */}
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={toggleDarkMode}
                            className={clsx(
                                "p-3 rounded-full transition-colors duration-200",
                                isDarkMode
                                    ? "bg-white text-gray-900 hover:bg-gray-100"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <div className={clsx("inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 animate-bounce", isDarkMode ? "bg-white" : "bg-black")}>
                            <LockClosedIcon className={clsx("w-12 h-12", isDarkMode ? "text-gray-900" : "text-white")} />
                        </div>
                        <h1 className={clsx("text-6xl md:text-7xl font-bold mb-8 tracking-tight", isDarkMode ? "text-white" : "text-black")}>
                            MyDefiNomineeVault
                        </h1>
                        <p className={clsx("text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                            Secure your digital legacy with time-locked encryption. Share important files and messages
                            with nominees that unlock automatically at your chosen time.
                        </p>

                        {/* Main Wallet Connect Button - The Star of the Show */}
                        <div className="flex justify-center mb-16">
                            <div className="transform hover:scale-105 transition-transform duration-300">
                                <ConnectButton.Custom>
                                    {({
                                        account,
                                        chain,
                                        openAccountModal,
                                        openChainModal,
                                        openConnectModal,
                                        mounted,
                                    }) => {
                                        const ready = mounted;
                                        const connected = ready && account && chain;

                                        return (
                                            <div
                                                {...(!ready && {
                                                    'aria-hidden': true,
                                                    'style': {
                                                        opacity: 0,
                                                        pointerEvents: 'none',
                                                        userSelect: 'none',
                                                    },
                                                })}
                                            >
                                                {(() => {
                                                    if (!connected) {
                                                        return (
                                                            <button
                                                                onClick={openConnectModal}
                                                                type="button"
                                                                className={clsx(
                                                                    "inline-flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl",
                                                                    isDarkMode
                                                                        ? "bg-white text-gray-900 hover:bg-gray-100"
                                                                        : "bg-black text-white hover:bg-gray-800"
                                                                )}
                                                            >
                                                                <LockClosedIcon className="w-6 h-6" />
                                                                <span>Connect Wallet</span>
                                                            </button>
                                                        );
                                                    }

                                                    if (chain.unsupported) {
                                                        return (
                                                            <button
                                                                onClick={openChainModal}
                                                                type="button"
                                                                className="inline-flex items-center space-x-3 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors"
                                                            >
                                                                <span>Wrong network</span>
                                                            </button>
                                                        );
                                                    }

                                                    return (
                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={openChainModal}
                                                                type="button"
                                                                className={clsx(
                                                                    "inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                                                    isDarkMode
                                                                        ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                )}
                                                            >
                                                                {chain.hasIcon && (
                                                                    <div
                                                                        style={{
                                                                            background: chain.iconBackground,
                                                                            width: 12,
                                                                            height: 12,
                                                                            borderRadius: 999,
                                                                            overflow: 'hidden',
                                                                        }}
                                                                    >
                                                                        {chain.iconUrl && (
                                                                            <Image
                                                                                alt={chain.name ?? 'Chain icon'}
                                                                                src={chain.iconUrl}
                                                                                style={{ width: 12, height: 12 }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {chain.name}
                                                            </button>

                                                            <button
                                                                onClick={openAccountModal}
                                                                type="button"
                                                                className={clsx(
                                                                    "inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                                                    isDarkMode
                                                                        ? "bg-white text-gray-900 hover:bg-gray-100"
                                                                        : "bg-black text-white hover:bg-gray-800"
                                                                )}
                                                            >
                                                                {account.displayBalance
                                                                    ? `${account.displayBalance}`
                                                                    : account.displayName}
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        );
                                    }}
                                </ConnectButton.Custom>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <div className={clsx(
                            "p-8 rounded-2xl shadow-lg border transition-all duration-500 transform hover:-translate-y-3",
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:shadow-2xl hover:shadow-gray-900/50"
                                : "bg-white border-gray-200 hover:shadow-2xl"
                        )}>
                            <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center mb-6", isDarkMode ? "bg-white" : "bg-black")}>
                                <ClockIcon className={clsx("w-8 h-8", isDarkMode ? "text-gray-900" : "text-white")} />
                            </div>
                            <h3 className={clsx("text-2xl font-bold mb-4", isDarkMode ? "text-white" : "text-black")}>Time-Locked Security</h3>
                            <p className={clsx("leading-relaxed", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                Your data remains encrypted until the exact moment you specify.
                                Perfect for wills, legal documents, or time-sensitive information.
                            </p>
                        </div>

                        <div className={clsx(
                            "p-8 rounded-2xl shadow-lg border transition-all duration-500 transform hover:-translate-y-3",
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:shadow-2xl hover:shadow-gray-900/50"
                                : "bg-white border-gray-200 hover:shadow-2xl"
                        )}>
                            <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center mb-6", isDarkMode ? "bg-white" : "bg-black")}>
                                <UserGroupIcon className={clsx("w-8 h-8", isDarkMode ? "text-gray-900" : "text-white")} />
                            </div>
                            <h3 className={clsx("text-2xl font-bold mb-4", isDarkMode ? "text-white" : "text-black")}>Nominee System</h3>
                            <p className={clsx("leading-relaxed", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                Grant access to up to 5 trusted individuals. They can only decrypt
                                your data after the specified time has passed.
                            </p>
                        </div>

                        <div className={clsx(
                            "p-8 rounded-2xl shadow-lg border transition-all duration-500 transform hover:-translate-y-3",
                            isDarkMode
                                ? "bg-gray-800 border-gray-700 hover:shadow-2xl hover:shadow-gray-900/50"
                                : "bg-white border-gray-200 hover:shadow-2xl"
                        )}>
                            <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center mb-6", isDarkMode ? "bg-white" : "bg-black")}>
                                <ShieldCheckIcon className={clsx("w-8 h-8", isDarkMode ? "text-gray-900" : "text-white")} />
                            </div>
                            <h3 className={clsx("text-2xl font-bold mb-4", isDarkMode ? "text-white" : "text-black")}>Blockchain Security</h3>
                            <p className={clsx("leading-relaxed", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                Built on Ethereum with military-grade encryption. Your data is
                                protected by the most secure blockchain technology available.
                            </p>
                        </div>
                    </div>

                    {/* Use Cases */}
                    <div className={clsx("p-12 rounded-3xl mb-16", isDarkMode ? "bg-gray-800" : "bg-black")}>
                        <h2 className={clsx("text-4xl font-bold text-center mb-12", isDarkMode ? "text-white" : "text-white")}>Perfect For</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center group">
                                <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300", isDarkMode ? "bg-gray-700" : "bg-white")}>
                                    <DocumentTextIcon className={clsx("w-8 h-8", isDarkMode ? "text-white" : "text-black")} />
                                </div>
                                <h4 className={clsx("text-xl font-semibold mb-2", isDarkMode ? "text-white" : "text-white")}>Legal Documents</h4>
                                <p className={clsx("text-sm", isDarkMode ? "text-gray-400" : "text-gray-400")}>Wills, contracts, and legal agreements</p>
                            </div>
                            <div className="text-center group">
                                <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300", isDarkMode ? "bg-gray-700" : "bg-white")}>
                                    <KeyIcon className={clsx("w-8 h-8", isDarkMode ? "text-white" : "text-black")} />
                                </div>
                                <h4 className={clsx("text-xl font-semibold mb-2", isDarkMode ? "text-white" : "text-white")}>Digital Keys</h4>
                                <p className={clsx("text-sm", isDarkMode ? "text-gray-400" : "text-gray-400")}>Passwords, access codes, and credentials</p>
                            </div>
                            <div className="text-center group">
                                <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300", isDarkMode ? "bg-gray-700" : "bg-white")}>
                                    <GlobeAltIcon className={clsx("w-8 h-8", isDarkMode ? "text-white" : "text-black")} />
                                </div>
                                <h4 className={clsx("text-xl font-semibold mb-2", isDarkMode ? "text-white" : "text-white")}>Business Plans</h4>
                                <p className={clsx("text-sm", isDarkMode ? "text-gray-400" : "text-gray-400")}>Strategic documents and future plans</p>
                            </div>
                            <div className="text-center group">
                                <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300", isDarkMode ? "bg-gray-700" : "bg-white")}>
                                    <SparklesIcon className={clsx("w-8 h-8", isDarkMode ? "text-white" : "text-black")} />
                                </div>
                                <h4 className={clsx("text-xl font-semibold mb-2", isDarkMode ? "text-white" : "text-white")}>Personal Legacy</h4>
                                <p className={clsx("text-sm", isDarkMode ? "text-gray-400" : "text-gray-400")}>Messages and memories for loved ones</p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary CTA Section */}
                    <div className="text-center">
                        <div className={clsx(
                            "p-8 rounded-2xl shadow-lg border",
                            isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                        )}>
                            <h3 className={clsx("text-3xl font-bold mb-4", isDarkMode ? "text-white" : "text-black")}>Ready to Secure Your Digital Future?</h3>
                            <p className={clsx("mb-8 text-lg", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                Connect your wallet above to start creating time-locked vaults and sharing with nominees.
                            </p>
                            <div className={clsx(
                                "inline-flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg",
                                isDarkMode
                                    ? "bg-white text-gray-900"
                                    : "bg-black text-white"
                            )}>
                                <LockClosedIcon className="w-6 h-6" />
                                <span>Start Building Your Legacy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx("min-h-screen", isDarkMode ? "bg-gray-900" : "bg-white")}>
            {/* Header */}
            <div className={clsx("border-b py-6", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", isDarkMode ? "bg-white" : "bg-black")}>
                                <LockClosedIcon className={clsx("w-6 h-6", isDarkMode ? "text-gray-900" : "text-white")} />
                            </div>
                            <div>
                                <h1 className={clsx("text-2xl font-bold", isDarkMode ? "text-white" : "text-black")}>MyDefiNomineeVault</h1>
                                <p className={clsx("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>Secure your digital legacy</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors duration-200",
                                    isDarkMode
                                        ? "bg-gray-700 text-white hover:bg-gray-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                            </button>

                                                         {/* Compact Wallet Display with Dropdown */}
                             {userAddress && (
                                 <div className="relative wallet-menu-container">
                                     <div
                                         className={clsx(
                                             "flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200",
                                             isDarkMode
                                                 ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                                 : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                         )}
                                         onClick={() => setShowWalletMenu(!showWalletMenu)}
                                     >
                                         <div className="relative">
                                             <WalletIcon
                                                 className={clsx(
                                                     "w-6 h-6 transition-transform duration-200",
                                                     isDarkMode ? "text-white" : "text-black"
                                                 )}
                                             />
                                             <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
                                         </div>
                                     </div>

                                     {/* Wallet Dropdown Menu */}
                                     {showWalletMenu && (
                                         <div className={clsx(
                                             "absolute right-0 top-12 w-48 rounded-lg shadow-lg border z-50",
                                             isDarkMode
                                                 ? "bg-gray-800 border-gray-700"
                                                 : "bg-white border-gray-200"
                                         )}>
                                             <div className="py-2">
                                                 {/* Copy Address Option */}
                                                 <button
                                                     onClick={() => {
                                                         copyToClipboard(userAddress);
                                                         setShowWalletMenu(false);
                                                     }}
                                                     className={clsx(
                                                         "w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2",
                                                         isDarkMode
                                                             ? "text-gray-200 hover:bg-gray-700"
                                                             : "text-gray-700 hover:bg-gray-100"
                                                     )}
                                                 >
                                                     <DocumentIcon className="w-4 h-4" />
                                                     <span>Copy Address</span>
                                                 </button>

                                                 {/* Disconnect Option */}
                                                 <button
                                                     onClick={() => {
                                                         // Use RainbowKit's disconnect method
                                                         if (typeof window !== 'undefined') {
                                                             // Clear local storage and reload to force disconnect
                                                             localStorage.clear();
                                                             sessionStorage.clear();
                                                             window.location.reload();
                                                         }
                                                         setShowWalletMenu(false);
                                                     }}
                                                     className={clsx(
                                                         "w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2",
                                                         isDarkMode
                                                             ? "text-red-400 hover:bg-gray-700"
                                                             : "text-red-600 hover:bg-gray-100"
                                                     )}
                                                 >
                                                     <XMarkIcon className="w-4 h-4" />
                                                     <span>Disconnect</span>
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification - Bottom Center */}
            {showCopied && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                    <div className={clsx("bg-black text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce", isDarkMode ? "bg-white" : "bg-black")}>
                        <div className={clsx("w-2 h-2 rounded-full animate-pulse transition-all duration-300", isDarkMode ? "bg-black" : "bg-white")}></div>
                        <span className={clsx("font-medium", isDarkMode ? "text-black" : "text-white")}>Your address has been copied to clipboard!</span>
                        <div className={clsx("w-2 h-2 rounded-full animate-pulse transition-all duration-300 delay-100", isDarkMode ? "bg-black" : "bg-white")}></div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Tab.Group>
                    <Tab.List className={clsx("flex space-x-1 rounded-xl p-1 mb-8", isDarkMode ? "bg-gray-700" : "bg-gray-100")}>
                        <Tab
                            className={({ selected }) =>
                                clsx(
                                    'w-full rounded-lg py-3 text-sm font-medium leading-5',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? isDarkMode
                                            ? 'bg-white text-gray-900 shadow'
                                            : 'bg-white text-black shadow'
                                        : isDarkMode
                                            ? 'text-gray-300 hover:bg-gray-600 hover:text-white'
                                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-black'
                                )
                            }
                        >
                            Create Vault
                        </Tab>
                        <Tab
                            className={({ selected }) =>
                                clsx(
                                    'w-full rounded-lg py-3 text-sm font-medium leading-5',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? isDarkMode
                                            ? 'bg-white text-gray-900 shadow'
                                            : 'bg-white text-black shadow'
                                        : isDarkMode
                                            ? 'text-gray-300 hover:bg-gray-600 hover:text-white'
                                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-black'
                                )
                            }
                        >
                            Vault Dashboard
                        </Tab>
                    </Tab.List>

                    <Tab.Panels>
                        {/* Create Vault Panel */}
                        <Tab.Panel>
                            <div className={clsx("border rounded-lg p-6 shadow-sm", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                                <h2 className={clsx("text-2xl font-semibold mb-6", isDarkMode ? "text-white" : "text-gray-900")}>Create New TimeLock Vault</h2>
                                <form onSubmit={(e) => { e.preventDefault(); createNomineeRequest.mutate(); }}>
                                    {/* File Upload Component (Optional) */}
                                    <div className="mb-6">
                                        <label className={clsx("block text-sm font-medium mb-2", isDarkMode ? "text-gray-200" : "text-gray-700")}>
                                            Attach File (Optional) - Max 10MB - Will be stored on IPFS
                                        </label>
                                        {!selectedFile ? (
                                            <div className={clsx("border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors", isDarkMode ? "border-gray-600" : "border-gray-300")}>
                                                <input
                                                    type="file"
                                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                                    className="hidden"
                                                    id="file-upload"
                                                    accept="*/*"
                                                />
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <DocumentIcon className={clsx("mx-auto h-12 w-12", isDarkMode ? "text-gray-500" : "text-gray-400")} />
                                                    <p className={clsx("mt-2 text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                                        <span className={clsx("font-medium hover:text-gray-700", isDarkMode ? "text-white hover:text-gray-200" : "text-black")}>Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className={clsx("text-xs mt-1", isDarkMode ? "text-gray-500" : "text-gray-500")}>Any file type up to 10MB</p>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className={clsx("border rounded-lg p-4", isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200")}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        {React.createElement(getFileIcon(selectedFile.type), { className: clsx("w-8 h-8", isDarkMode ? "text-gray-400" : "text-gray-600") })}
                                                        <div>
                                                            <p className={clsx("text-sm font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{selectedFile.name}</p>
                                                            <p className={clsx("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>{formatFileSize(selectedFile.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeSelectedFile}
                                                        className={clsx("hover:text-gray-600", isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400")}
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>



                                    {/* Description */}
                                    <div className="mb-6">
                                        <label className={clsx("block text-sm font-medium mb-2", isDarkMode ? "text-gray-200" : "text-gray-700")}>
                                            Vault Description * <span className={clsx("text-xs font-normal", description.length > 35 ? "text-red-500" : "text-gray-500")}>
                                                ({description.length}/35)
                                            </span>
                                        </label>
                                        <textarea
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            maxLength={35}
                                            rows={3}
                                            className={clsx(
                                                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
                                                isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                    : "bg-white border-gray-300 text-black placeholder-gray-500"
                                            )}
                                            placeholder="Describe what this vault contains (be specific)"
                                        />
                                    </div>

                                    {/* Size Warning */}
                                    <div className={clsx("mb-6 p-3 rounded-lg border-2", )}>
                                        <div className="flex items-start space-x-3">
                                            <ExclamationTriangleIcon className={clsx("w-5 h-5 mt-0.5 flex-shrink-0", isDarkMode ? "text-yellow-400" : "text-yellow-600")} />
                                            <div>
                                                <h4 className={clsx("font-medium mb-1", isDarkMode ? "text-white" : "text-gray-500")}>
                                                    {/* Encryption Size Limit */}
                                                    Blocklock-js has a 256-byte encryption limit. Longer text will cause errors.
                                                </h4>
                                                {/* <p className={clsx("text-sm", isDarkMode ? "text-yellow-300" : "text-yellow-700")}>
                                                    <strong>Description:</strong> Keep under 35 characters<br/>
                                                    <strong>Nominee:</strong> 1 wallet address only<br/>
                                                    <strong>Why?</strong> Blocklock-js has a 256-byte encryption limit. Longer text will cause errors.
                                                </p> */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nominees */}
                                    <div className="mb-6">
                                        <label className={clsx("block text-sm font-medium mb-2", isDarkMode ? "text-gray-200" : "text-gray-700")}>
                                            Nominee (1 wallet address) *
                                        </label>
                                        <div className="space-y-3">
                                            {nominees.map((nominee, index) => (
                                                <div key={index} className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={nominee}
                                                        onChange={(e) => updateNominee(index, e.target.value)}
                                                        className={clsx(
                                                            "flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
                                                            isDarkMode
                                                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                                : "bg-white border-gray-300 text-black placeholder-gray-500"
                                                        )}
                                                        placeholder="Enter wallet address"
                                                        required
                                                    />
                                                    {nominees.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNominee(index)}
                                                            className="px-3 py-2 text-red-600 hover:text-red-800"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                    </div>

                                    {/* Unlock Date */}
                                    <div className="mb-6">
                                        <label className={clsx("block text-sm font-medium mb-2", isDarkMode ? "text-gray-200" : "text-gray-700")}>
                                            Unlock Date *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="datetime-local"
                                                value={unlockDate}
                                                onChange={(e) => setUnlockDate(e.target.value)}
                                                className={clsx(
                                                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
                                                    isDarkMode 
                                                        ? "bg-gray-700 border-gray-600 text-white" 
                                                        : "bg-white border-gray-300 text-black"
                                                )}
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <CalendarIcon className={clsx("w-5 h-5", isDarkMode ? "text-gray-400" : "text-gray-400")} />
                                            </div>
                                        </div>
                                        <p className={clsx("mt-1 text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                                            Select when your vault should unlock for nominees
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!isValid || createNomineeRequest.isPending}
                                        className={clsx(
                                            "w-full py-3 px-6 rounded-lg font-medium transition-colors",
                                            isDarkMode
                                                ? "bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                                : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {createNomineeRequest.isPending ? "Creating Vault..." : "Create TimeLock Vault"}
                                    </button>

                                    {createNomineeRequest.error && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-red-800 text-sm">
                                                Error: {createNomineeRequest.error.message}
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </Tab.Panel>

                        {/* Vault Dashboard Panel */}
                        <Tab.Panel>
                            <div className="space-y-8">
                                {/* My Created Vaults */}
                                {myFileAssets.length > 0 && (
                                    <div>
                                        <h3 className={clsx("text-xl font-semibold mb-4 flex items-center", isDarkMode ? "text-white" : "text-gray-900")}>
                                            <DocumentIcon className="w-5 h-5 mr-2" />
                                            My Created Vaults
                                        </h3>
                                        <div className="grid gap-4">
                                            {myFileAssets.map((asset: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                <div key={asset.id} className={clsx(
                                                    "border rounded-lg p-4 hover:shadow-md transition-shadow",
                                                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                                )}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className={clsx("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>
                                                                Owner: {asset.owner.address.substring(0, 10)}...{asset.owner.address.substring(asset.owner.address.length - 8)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Complete Vault Data:', asset);
                                                                    alert('Check console for complete vault data!');
                                                                }}
                                                                className={clsx(
                                                                    "inline-flex items-center px-3 py-1 text-sm rounded-md transition-colors",
                                                                    isDarkMode
                                                                        ? "bg-gray-600 text-white hover:bg-gray-500"
                                                                        : "bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white"
                                                                )}
                                                            >
                                                                <DocumentIcon className="w-4 h-4 mr-1" />
                                                                View Raw Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Locked Vaults Shared With Me */}
                                {lockedVaults && lockedVaults.length > 0 && (
                                    <div>
                                        <h3 className={clsx("text-xl font-semibold mb-4 flex items-center", isDarkMode ? "text-white" : "text-gray-900")}>
                                            <LockClosedIcon className="w-5 h-5 mr-2" />
                                            Locked Vaults (Shared With Me)
                                        </h3>
                                        <div className="grid gap-4">
                                            {lockedVaults.map((vault: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                <div key={vault.id} className={clsx(
                                                    "border rounded-lg p-4 hover:shadow-md transition-shadow",
                                                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                                )}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className={clsx("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>
                                                                Owner: {vault.owner_wallet_address.substring(0, 10)}...{vault.owner_wallet_address.substring(vault.owner_wallet_address.length - 8)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center space-x-2">
                                                                <LockClosedIcon className={clsx("w-5 h-5", isDarkMode ? "text-gray-400" : "text-gray-600")} />
                                                                <span className={clsx("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                                                                    Unlocks: {new Date(vault.unlocks_on).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Unlocked Vaults Shared With Me */}
                                {myNomineeFileAssets.length > 0 && (
                                    <div>
                                        <h3 className={clsx("text-xl font-semibold mb-4 flex items-center", isDarkMode ? "text-white" : "text-gray-900")}>
                                            <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                            Unlocked Vaults (Shared With Me)
                                        </h3>
                                        <div className="grid gap-4">
                                            {myNomineeFileAssets.map((asset: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                <div key={asset.id} className={clsx(
                                                    "border rounded-lg p-4 hover:shadow-md transition-shadow",
                                                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                                )}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className={clsx("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>
                                                                Owner: {asset.owner.address.substring(0, 10)}...{asset.owner.address.substring(asset.owner.address.length - 8)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Complete Vault Data:', asset);
                                                                    alert('Check console for complete vault data!');
                                                                }}
                                                                className={clsx(
                                                                    "inline-flex items-center px-3 py-1 text-sm rounded-md transition-colors",
                                                                    isDarkMode
                                                                        ? "bg-gray-600 text-white hover:bg-gray-500"
                                                                        : "bg-gray-200 text-gray-700 hover:bg-gray-800"
                                                                )}
                                                            >
                                                                <DocumentIcon className="w-4 h-4 mr-1" />
                                                                View Raw Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Vaults Message */}
                                {allFileAssets.length === 0 && (
                                    <div className="text-center py-12">
                                        <DocumentIcon className={clsx("mx-auto h-12 w-12", isDarkMode ? "text-gray-500" : "text-gray-400")} />
                                        <h3 className={clsx("mt-2 text-sm font-medium", isDarkMode ? "text-white" : "text-gray-900")}>No vaults found</h3>
                                        <p className={clsx("mt-1 text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                                            You haven&apos;t created any vaults yet, and no one has shared any vaults with you.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
}
