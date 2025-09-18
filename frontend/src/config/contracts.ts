export const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum ZamaKYC.KYCStatus",
        "name": "oldStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "enum ZamaKYC.KYCStatus",
        "name": "newStatus",
        "type": "uint8"
      }
    ],
    "name": "KYCStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "KYCSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getKYCData",
    "outputs": [
      {
        "internalType": "euint256",
        "name": "identityHash",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "name",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "nationality",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "birthYear",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getKYCStatus",
    "outputs": [
      {
        "internalType": "enum ZamaKYC.KYCStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "hasKYCRecord",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint256",
        "name": "encryptedIdentityHash",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedName",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedNationality",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedBirthYear",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "submitKYC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;