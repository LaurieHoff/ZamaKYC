// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ZamaKYC is SepoliaConfig {
    address public owner;
    
    enum KYCStatus {
        Pending,
        Verified,
        Rejected
    }
    
    struct KYCInfo {
        string identityDocumentHash;    // IPFS hash（明文存储）
        string name;                    // 姓名（明文存储）
        euint32 nationality;            // 国籍ID的加密数字
        euint32 birthYear;              // 出生年份的加密数字
        KYCStatus status;               // KYC状态（明文）
        uint256 timestamp;              // 提交时间戳
        bool exists;                    // 是否存在记录
    }
    
    mapping(address => KYCInfo) private kycRecords;
    address[] public registeredUsers;
    
    event KYCSubmitted(address indexed user, uint256 timestamp);
    event KYCStatusChanged(address indexed user, KYCStatus oldStatus, KYCStatus newStatus);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier kycExists(address user) {
        require(kycRecords[user].exists, "KYC record does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function submitKYC(
        string calldata _identityDocumentHash,
        string calldata _name,
        externalEuint32 _nationality,
        externalEuint32 _birthYear,
        bytes calldata inputProof
    ) external {
        require(!kycRecords[msg.sender].exists, "KYC already submitted");
        
        // 验证并转换外部加密输入
        euint32 encryptedNationality = FHE.fromExternal(_nationality, inputProof);
        euint32 encryptedBirthYear = FHE.fromExternal(_birthYear, inputProof);

        // 创建KYC记录
        kycRecords[msg.sender] = KYCInfo({
            identityDocumentHash: _identityDocumentHash,  // IPFS hash明文存储
            name: _name,  // 姓名明文存储
            nationality: encryptedNationality,
            birthYear: encryptedBirthYear,
            status: KYCStatus.Pending,
            timestamp: block.timestamp,
            exists: true
        });
        
        registeredUsers.push(msg.sender);
        
        // 设置访问控制权限
        FHE.allowThis(encryptedNationality);
        FHE.allow(encryptedNationality, owner);
        FHE.allowThis(encryptedBirthYear);
        FHE.allow(encryptedBirthYear, owner);
        
        emit KYCSubmitted(msg.sender, block.timestamp);
    }
    
    function verifyKYC(address user) external onlyOwner kycExists(user) {
        KYCStatus oldStatus = kycRecords[user].status;
        require(oldStatus == KYCStatus.Pending, "KYC is not in pending status");
        
        kycRecords[user].status = KYCStatus.Verified;
        
        emit KYCStatusChanged(user, oldStatus, KYCStatus.Verified);
    }
    
    function rejectKYC(address user) external onlyOwner kycExists(user) {
        KYCStatus oldStatus = kycRecords[user].status;
        require(oldStatus == KYCStatus.Pending, "KYC is not in pending status");
        
        kycRecords[user].status = KYCStatus.Rejected;
        
        emit KYCStatusChanged(user, oldStatus, KYCStatus.Rejected);
    }
    
    function getKYCStatus(address user) external view kycExists(user) returns (KYCStatus, uint256) {
        return (kycRecords[user].status, kycRecords[user].timestamp);
    }

    function getKYCName(address user) external view kycExists(user) returns (string memory) {
        return kycRecords[user].name;
    }

    function getKYCDocumentHash(address user) external view kycExists(user) returns (string memory) {
        return kycRecords[user].identityDocumentHash;
    }
    
    function getKYCInfo(address user) external view kycExists(user) returns (
        string memory identityDocumentHash,
        string memory name,
        euint32 nationality,
        euint32 birthYear
    ) {
        KYCInfo storage kyc = kycRecords[user];
        return (
            kyc.identityDocumentHash,
            kyc.name,
            kyc.nationality,
            kyc.birthYear
        );
    }
    
    function isKYCVerified(address user) external view returns (bool) {
        if (!kycRecords[user].exists) {
            return false;
        }
        return kycRecords[user].status == KYCStatus.Verified;
    }
    
    function getPendingKYCCount() external view onlyOwner returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < registeredUsers.length; i++) {
            if (kycRecords[registeredUsers[i]].status == KYCStatus.Pending) {
                count++;
            }
        }
        return count;
    }
    
    function getAllRegisteredUsers() external view onlyOwner returns (address[] memory) {
        return registeredUsers;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    function hasKYCRecord(address user) external view returns (bool) {
        return kycRecords[user].exists;
    }
}