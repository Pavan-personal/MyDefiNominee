// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TypesLib} from "blocklock-solidity/src/libraries/TypesLib.sol";
import {AbstractBlocklockReceiver} from "blocklock-solidity/src/AbstractBlocklockReceiver.sol";

contract MyBlocklockReceiver is AbstractBlocklockReceiver {
    
    uint256 public currentRequestId;

    struct Request {
        address requestedBy;                 
        uint32 encryptedAt;                  
        uint32 decryptedAt;                  
        TypesLib.Ciphertext encryptedValue; 
        string message;                     
    }

    mapping(uint256 => Request) public userRequests;

    constructor(address blocklockSender) AbstractBlocklockReceiver(blocklockSender) {}

    function createTimelockRequestWithDirectFunding(
        uint32 callbackGasLimit,
        uint32 _encryptedAt,
        uint32 _decryptedAt,
        bytes calldata condition,
        TypesLib.Ciphertext calldata encryptedData
    ) external payable returns (uint256, uint256) {
        // create timelock request
        (uint256 _requestId, uint256 requestPrice) =
            _requestBlocklockPayInNative(callbackGasLimit, condition, encryptedData);
        // store request id
        currentRequestId = _requestId;
        currentRequestId = _requestId;
            // store Ciphertext
            userRequests[_requestId] = Request({
            requestedBy: msg.sender,
            encryptedAt: _encryptedAt,
            decryptedAt: _decryptedAt,
            encryptedValue: encryptedData,
            message:""
        });
        return (currentRequestId, requestPrice);
    }

    function _onBlocklockReceived(uint256 _requestId, bytes calldata decryptionKey) internal override {
        require(currentRequestId == _requestId, "Invalid request id.");
        Request storage request = userRequests[_requestId];
        // decrypt stored Ciphertext with decryption key
        request.message = abi.decode(_decrypt(request.encryptedValue, decryptionKey), (string));
    }
}