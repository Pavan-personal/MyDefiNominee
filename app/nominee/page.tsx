"use client";

import { useNominee } from "@/hooks/useNominee";
import { Tab } from "@headlessui/react";
import { 
  PlusIcon, 
  XMarkIcon, 
  ClockIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import React from "react"; // Added missing import for React

export default function NomineePage() {
  const {
    activeTab,
    setActiveTab,
    title,
    setTitle,
    description,
    setDescription,
    nominees,
    unlockDate,
    setUnlockDate,
    estimatedUnlockTime,
    selectedFile,
    addNominee,
    removeNominee,
    updateNominee,
    handleFileSelect,
    removeSelectedFile,
    createNomineeRequest,
    myFileAssets,
    myNomineeFileAssets,
    userAddress,
    isValid,
    downloadFile,
    formatFileSize
  } = useNominee();

  const allFileAssets = [...myFileAssets, ...myNomineeFileAssets];

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return PhotoIcon;
    if (fileType.startsWith('video/')) return FilmIcon;
    if (fileType.includes('pdf') || fileType.includes('document')) return DocumentIcon;
    if (fileType.includes('zip') || fileType.includes('archive')) return ArchiveBoxIcon;
    return DocumentTextIcon;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold">File Nominee System</h1>
          <p className="text-gray-300 mt-2">
            Securely store and share encrypted files with nominees after a specified time
          </p>
          {userAddress && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-300">
                <UserIcon className="h-4 w-4 inline mr-2" />
                Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tab.Group selectedIndex={activeTab === "create" ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? "create" : "dashboard")}>
          <Tab.List className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            <Tab
              className={({ selected }) =>
                clsx(
                  'w-full py-2.5 text-sm font-medium leading-5 rounded-md',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-black shadow'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                )
              }
            >
              Upload File
            </Tab>
            <Tab
              className={({ selected }) =>
                clsx(
                  'w-full py-2.5 text-sm font-medium leading-5 rounded-md',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-black shadow'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                )
              }
            >
              File Dashboard
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* Upload File Panel */}
            <Tab.Panel>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload New File for Nominees</h2>
                
                <form onSubmit={(e) => { e.preventDefault(); createNomineeRequest.mutate(); }}>
                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File (Max 10MB)
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
                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Click to select a file or drag and drop</p>
                          <p className="text-gray-400 text-sm mt-1">PDF, Images, Videos, Documents, etc.</p>
                        </label>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {React.createElement(getFileIcon(selectedFile.type), { className: "h-8 w-8 text-blue-600" })}
                            <div>
                              <p className="font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)} • {selectedFile.type}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter a title for this file"
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
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Describe what this file contains"
                    />
                  </div>

                  {/* Nominees */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nominees (1-5)
                      </label>
                      <button
                        type="button"
                        onClick={addNominee}
                        disabled={nominees.length >= 5}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Nominee
                      </button>
                    </div>
                    
                    {nominees.map((nominee, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={nominee}
                          onChange={(e) => updateNominee(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Enter nominee wallet address (0x...)"
                        />
                        {nominees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNominee(index)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Unlock Date */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unlock Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    {estimatedUnlockTime && (
                      <p className="mt-2 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {estimatedUnlockTime}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isValid || createNomineeRequest.isPending}
                    className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {createNomineeRequest.isPending ? "Uploading File..." : "Upload File for Nominees"}
                  </button>
                </form>

                {/* Error Display */}
                {createNomineeRequest.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">
                      Error: {createNomineeRequest.error.message}
                    </p>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* File Dashboard Panel */}
            <Tab.Panel>
              <div className="space-y-8">
                {/* My File Assets (As Owner) */}
                {myFileAssets.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                      <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
                      My Uploaded Files
                    </h2>
                    
                    <div className="space-y-4">
                      {myFileAssets.map((asset) => (
                        <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {React.createElement(getFileIcon(asset.fileType), { className: "h-6 w-6 text-blue-600" })}
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">{asset.title}</h3>
                                  <p className="text-sm text-gray-500">{asset.fileName}</p>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{asset.description}</p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <UserGroupIcon className="h-4 w-4 mr-1" />
                                  {asset.nominees.length} nominees
                                </div>
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {asset.unlockTime.toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <DocumentIcon className="h-4 w-4 mr-1" />
                                  {formatFileSize(asset.fileSize)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-4 flex flex-col items-end space-y-2">
                              <span className={clsx(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                asset.status === 'locked' && 'bg-yellow-100 text-yellow-800',
                                asset.status === 'unlocked' && 'bg-green-100 text-green-800'
                              )}>
                                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                              </span>
                              
                              {asset.status === 'unlocked' && (
                                <button
                                  onClick={() => downloadFile(asset)}
                                  className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                                >
                                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
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

                {/* My Nominee File Assets (As Nominee) */}
                {myNomineeFileAssets.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                      <UserIcon className="h-6 w-6 mr-2 text-green-600" />
                      Files Shared With Me
                    </h2>
                    
                    <div className="space-y-4">
                      {myNomineeFileAssets.map((asset) => (
                        <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {React.createElement(getFileIcon(asset.fileType), { className: "h-6 w-6 text-green-600" })}
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">{asset.title}</h3>
                                  <p className="text-sm text-gray-500">{asset.fileName}</p>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{asset.description}</p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  Owner: {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                                </div>
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {asset.unlockTime.toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <DocumentIcon className="h-4 w-4 mr-1" />
                                  {formatFileSize(asset.fileSize)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-4 flex flex-col items-end space-y-2">
                              <span className={clsx(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                asset.status === 'locked' && 'bg-yellow-100 text-yellow-800',
                                asset.status === 'unlocked' && 'bg-green-100 text-green-800'
                              )}>
                                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                              </span>
                              
                              {asset.status === 'unlocked' && (
                                <button
                                  onClick={() => downloadFile(asset)}
                                  className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                                >
                                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
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

                {/* No Files */}
                {allFileAssets.length === 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center py-12">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No files found.</p>
                      <p className="text-gray-400 text-sm">
                        {myFileAssets.length === 0 && myNomineeFileAssets.length === 0 
                          ? "Upload your first file or wait to receive files as a nominee."
                          : "You haven&apos;t uploaded any files yet."
                        }
                      </p>
                    </div>
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
