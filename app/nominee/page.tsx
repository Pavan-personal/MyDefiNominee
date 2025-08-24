"use client";
import { useNominee } from "@/hooks/useNominee";
import { Tab } from "@headlessui/react";
import { 
  PlusIcon, XMarkIcon, ClockIcon, UserGroupIcon, DocumentTextIcon,
  UserIcon, ShieldCheckIcon, DocumentIcon, PhotoIcon, FilmIcon, ArchiveBoxIcon, ArrowDownTrayIcon,
  LockClosedIcon, KeyIcon, GlobeAltIcon, SparklesIcon
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import React from "react";

export default function NomineePage() {
  const {
    title, setTitle, description, setDescription, nominees,
    unlockDate, setUnlockDate, addNominee, removeNominee, updateNominee,
    createNomineeRequest, selectedFile, handleFileSelect, removeSelectedFile,
    myFileAssets, myNomineeFileAssets, userAddress, isValid, downloadFile, formatFileSize
  } = useNominee();

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-black rounded-full opacity-5 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-black rounded-full opacity-5 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black rounded-full opacity-3 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full mb-8 animate-bounce">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 tracking-tight">
              MyDefiNomineeVault
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Secure your digital legacy with time-locked encryption. Share important files and messages 
              with nominees that unlock automatically at your chosen time.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Time-Locked Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data remains encrypted until the exact moment you specify. 
                Perfect for wills, legal documents, or time-sensitive information.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Nominee System</h3>
              <p className="text-gray-600 leading-relaxed">
                Grant access to up to 5 trusted individuals. They can only decrypt 
                your data after the specified time has passed.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Blockchain Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Built on Ethereum with military-grade encryption. Your data is 
                protected by the most secure blockchain technology available.
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-black text-white p-12 rounded-3xl mb-16">
            <h2 className="text-4xl font-bold text-center mb-12">Perfect For</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-xl font-semibold mb-2">Legal Documents</h4>
                <p className="text-gray-400">Wills, contracts, and legal agreements</p>
              </div>
              <div className="text-center">
                <KeyIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-xl font-semibold mb-2">Digital Keys</h4>
                <p className="text-gray-400">Passwords, access codes, and credentials</p>
              </div>
              <div className="text-center">
                <GlobeAltIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-xl font-semibold mb-2">Business Plans</h4>
                <p className="text-gray-400">Strategic documents and future plans</p>
              </div>
              <div className="text-center">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-xl font-semibold mb-2">Personal Legacy</h4>
                <p className="text-gray-400">Messages and memories for loved ones</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-3xl font-bold text-black mb-4">Ready to Secure Your Digital Future?</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Connect your wallet to start creating time-locked vaults and sharing with nominees.
              </p>
              <div className="inline-flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg">
                <LockClosedIcon className="w-6 h-6" />
                <span>Connect Wallet to Continue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold">TimeLock Vault</h1>
          <p className="text-gray-300 mt-2">Secure your digital legacy with time-locked encryption and nominee access</p>
          {userAddress && (
            <div className="mt-4 flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              <span className="text-sm font-mono">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
            <Tab
              className={({ selected }) =>
                clsx(
                  'w-full rounded-lg py-3 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-black shadow'
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
                    ? 'bg-white text-black shadow'
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
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New TimeLock Vault</h2>
                <form onSubmit={(e) => { e.preventDefault(); createNomineeRequest.mutate(); }}>
                  {/* File Upload Component (Optional) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach File (Optional) - Max 10MB
                    </label>
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                          className="hidden"
                          id="file-upload"
                          accept="*/*"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-black hover:text-gray-700">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Any file type up to 10MB</p>
                        </label>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {React.createElement(getFileIcon(selectedFile.type), { className: "w-8 h-8 text-gray-600" })}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vault Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter a title for your vault"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Describe what this vault contains"
                    />
                  </div>

                  {/* Nominees */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nominees (1-5 wallet addresses) *
                    </label>
                    <div className="space-y-3">
                      {nominees.map((nominee, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={nominee}
                            onChange={(e) => updateNominee(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                    {nominees.length < 5 && (
                      <button
                        type="button"
                        onClick={addNominee}
                        className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Nominee
                      </button>
                    )}
                  </div>

                  {/* Unlock Date */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unlock Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || createNomineeRequest.isPending}
                    className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <DocumentIcon className="w-5 h-5 mr-2" />
                      My Created Vaults
                    </h3>
                    <div className="grid gap-4">
                      {myFileAssets.map((asset) => (
                        <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {React.createElement(getFileIcon(asset.fileType), { className: "w-8 h-8 text-gray-600" })}
                              <div>
                                <p className="font-medium text-gray-900">{asset.title}</p>
                                <p className="text-sm text-gray-500">{asset.description}</p>
                                {asset.fileName && (
                                  <p className="text-xs text-gray-400">{asset.fileName} • {formatFileSize(asset.fileSize)}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {asset.status === 'unlocked' ? 'Unlocked' : 'Unlocks ' + asset.unlockTime.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{asset.nominees.length} nominees</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vaults Shared With Me */}
                {myNomineeFileAssets.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2" />
                      Vaults Shared With Me
                    </h3>
                    <div className="grid gap-4">
                      {myNomineeFileAssets.map((asset) => (
                        <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {React.createElement(getFileIcon(asset.fileType), { className: "w-8 h-8 text-gray-600" })}
                              <div>
                                <p className="font-medium text-gray-900">{asset.title}</p>
                                <p className="text-sm text-gray-500">{asset.description}</p>
                                {asset.fileName && (
                                  <p className="text-xs text-gray-400">{asset.fileName} • {formatFileSize(asset.fileSize)}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {asset.status === 'unlocked' ? 'Unlocked' : 'Unlocks ' + asset.unlockTime.toLocaleDateString()}
                                </span>
                              </div>
                              {asset.status === 'unlocked' && (
                                <button
                                  onClick={() => downloadFile(asset)}
                                  className="inline-flex items-center px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                                >
                                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                                  Download
                                </button>
                              )}
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
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No vaults found</h3>
                    <p className="mt-1 text-sm text-gray-500">
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
