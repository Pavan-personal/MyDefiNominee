"use client";
import React from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import Header from "./header";
import Wallet from "../wallet";

import { useExplorer } from "@/hooks/useExplorer";
import { useEncrypt } from "@/hooks/useEncrypt";
import Footer from "@/components/Footer";

const BlockLockPage = () => {
  const { isConnected } = useAccount();

  const {
    handleEncrypt: encryptMutation,
    setActiveTab,
    setUserMessage,
    setBlocksAhead,
    activeTab,
    userMessage,
    blocksAhead,
    estimatedDecryptionTime,
  } = useEncrypt();

  const {
    mutateAsync: handleEncrypt,
    isPending: isEncrypting,
    isError: isEncryptError,
    error: encryptError,
  } = encryptMutation;

  const {
    data: requests,
    isLoading: isLoadingRequests,
    refetch,
  } = useExplorer(setActiveTab);

  return isConnected ? (
    <div className="bg-white-pattern">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-20 font-sans min-h-screen">
        {/* Tabs - Stack on mobile, side by side on desktop */}
        <div className="flex flex-col sm:flex-row justify-end mb-6 gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <button
              className={`w-full sm:w-[200px] py-3 font-funnel-sans text-gray-900 border border-gray-200 hover:border-gray-400 transition-colors text-center ${
                activeTab === "text" ? "border-gray-400 bg-white" : ""
              }`}
              onClick={() => setActiveTab("text")}
            >
              Encrypt
            </button>
            <button
              className={`w-full sm:w-[200px] py-3 font-funnel-sans text-gray-900 border border-gray-200 hover:border-gray-400 transition-colors text-center ${
                activeTab === "decrypt" ? "border-gray-400 bg-white" : ""
              }`}
              onClick={() => refetch()}
            >
              Explorer
            </button>
          </div>
        </div>
        {activeTab === "text" ? (
          <div className="bg-white border border-gray-200 p-4 sm:p-8 h-[550px]">
            {/* Text Areas Section - Stack on mobile, side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
              <div>
                <h2 className="text-xl text-gray-700 mb-4 font-funnel-display">
                  Plaintext
                </h2>
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  className="font-funnel-display w-full h-[200px]  text-gray-700 p-4 border border-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your text here..."
                />
              </div>
              <div className="hidden sm:block">
                <div className="w-full h-[280px] flex items-center justify-center">
                  <img
                    src="/assets/images/blocklock.gif"
                    alt="Encryption animation"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Blocks Ahead Section and Encrypt Button - Stack on mobile, side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 p-4">
              <div>
                <h2 className="text-xl text-gray-700 mb-4 font-funnel-display">
                  Decryption Time
                </h2>
                <p className="text-lg text-gray-700 mb-4 font-funnel-display">
                  Blocks Ahead
                </p>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="Enter number of blocks ahead"
                    value={blocksAhead}
                    onChange={(e) => setBlocksAhead(e.target.value)}
                    className="font-funnel-display w-full px-4 py-2 border border-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {estimatedDecryptionTime && (
                    <p className="text-sm text-gray-500 mt-2 font-funnel-display">
                      Estimated decryption: {estimatedDecryptionTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-end font-funnel-display mb-4">
                <button
                  onClick={() => handleEncrypt({ userMessage, blocksAhead })}
                  disabled={!userMessage || !blocksAhead || isEncrypting}
                  className={`font-funnel-display w-full h-11 text-gray-900 border border-gray-200 hover:border-gray-400 transition-colors text-center ${
                    !userMessage || !blocksAhead
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isEncrypting
                    ? "Encrypting..."
                    : isEncryptError
                    ? "Error Try Again"
                    : "Encrypt"}
                </button>
              </div>
            </div>
            {isEncryptError && (
              <div className="text-red-500 font-funnel-display max-w-5xl overflow-auto py-5">
                <div>{encryptError.message}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-4 sm:p-8 max-h-[900px] flex flex-col overflow-y-auto">
            {/* Explorer Section */}
            <div className="flex justify-between">
              <h2 className="text-xl text-gray-800 mb-6 font-funnel-display">
                Message Explorer
              </h2>
              <button onClick={() => refetch()}>
                <Image
                  className={`${
                    isLoadingRequests ? "animate-spin" : ""
                  } cursor-pointer mb-6`}
                  src="/assets/images/refresh.svg"
                  width={15}
                  height={15}
                  alt="Randamu Logo"
                />
              </button>
            </div>

            {requests && requests.length > 0 ? (
              <div className="overflow-y-auto flex-1 ">
                <div className="grid gap-6">
                  {requests.map((message) => (
                    <div
                      key={message.id}
                      className="border border-gray-200 shadow-sm p-6 bg-gray-50"
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            Request ID
                          </span>
                          <span className="text-gray-900 font-medium font-funnel-display">
                            {message.id}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            Encryption Block Number
                          </span>
                          <span className="text-gray-900 font-medium font-funnel-display">
                            {message.encryptedAt}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            Decryption Block Number
                          </span>
                          <span className="text-gray-900 font-medium font-funnel-display">
                            {message.decryptedAt}
                          </span>
                        </div>
                      </div>
                      {message.message != "" && (
                        <>
                          <div className="mt-2">
                            <span className="text-gray-500 text-sm font-funnel-display">
                              Decrypted Message
                            </span>
                            <div className="border border-gray-200 p-3 mt-1 bg-white overflow-x-auto">
                              <code className="text-sm text-gray-800 font-funnel-display">
                                {message.message}
                              </code>
                            </div>
                          </div>
                        </>
                      )}{" "}
                      {message.requestedBy != "" && (
                        <>
                          <div className="mt-2">
                            <span className="text-gray-500 text-sm font-funnel-display">
                              Requested By
                            </span>
                            <div className="border border-gray-200 p-3 mt-1 bg-white overflow-x-auto">
                              <code className="text-sm text-gray-800 font-funnel-display">
                                {message.requestedBy}
                              </code>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-funnel-display">
                  No encrypted messages found. Create one in the Encrypt tab.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  ) : (
    <Wallet />
  );
};

export default BlockLockPage;
