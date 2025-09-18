import { task } from "hardhat/config";

task("kyc:submit", "Submit KYC information")
  .addParam("contract", "The ZamaKYC contract address")
  .addParam("hash", "Identity document hash (as number)")
  .addParam("name", "Name (as number)")
  .addParam("nationality", "Nationality ID")
  .addParam("birthyear", "Birth year")
  .setAction(async (taskArgs, hre) => {
    const { fhevm } = hre;
    await fhevm.initializeCLIApi()
    const [signer] = await hre.ethers.getSigners();
    const contractAddress = taskArgs.contract;

    const contract = await hre.ethers.getContractAt("ZamaKYC", contractAddress);
    
    // Create encrypted inputs
    const input = fhevm.createEncryptedInput(contractAddress, signer.address);
    input.add256(BigInt(taskArgs.hash));      // Identity document hash
    input.add32(parseInt(taskArgs.name));     // Name as number
    input.add32(parseInt(taskArgs.nationality)); // Nationality ID
    input.add32(parseInt(taskArgs.birthyear));   // Birth year
    
    const encryptedInput = await input.encrypt();
    
    console.log("Submitting KYC information...");
    const tx = await contract.submitKYC(
      encryptedInput.handles[0], // hash
      encryptedInput.handles[1], // name
      encryptedInput.handles[2], // nationality
      encryptedInput.handles[3], // birth year
      encryptedInput.inputProof
    );
    
    await tx.wait();
    console.log("KYC submitted successfully!");
    console.log("Transaction hash:", tx.hash);
  });

task("kyc:status", "Get KYC status")
  .addParam("contract", "The ZamaKYC contract address")
  .addParam("user", "User address to check")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt("ZamaKYC", taskArgs.contract);
    
    try {
      const hasRecord = await contract.hasKYCRecord(taskArgs.user);
      if (!hasRecord) {
        console.log("No KYC record found for user:", taskArgs.user);
        return;
      }
      
      const [status, timestamp] = await contract.getKYCStatus(taskArgs.user);
      const statusText = ["Pending", "Verified", "Rejected"][status];
      
      console.log(`KYC Status for ${taskArgs.user}:`);
      console.log(`Status: ${statusText}`);
      console.log(`Submitted: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    } catch (error) {
      console.error("Error getting KYC status:", error);
    }
  });

task("kyc:verify", "Verify a pending KYC")
  .addParam("contract", "The ZamaKYC contract address")
  .addParam("user", "User address to verify")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("ZamaKYC", taskArgs.contract);
    
    console.log("Verifying KYC for user:", taskArgs.user);
    const tx = await contract.verifyKYC(taskArgs.user);
    await tx.wait();
    
    console.log("KYC verified successfully!");
    console.log("Transaction hash:", tx.hash);
  });

task("kyc:reject", "Reject a pending KYC")
  .addParam("contract", "The ZamaKYC contract address")
  .addParam("user", "User address to reject")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("ZamaKYC", taskArgs.contract);
    
    console.log("Rejecting KYC for user:", taskArgs.user);
    const tx = await contract.rejectKYC(taskArgs.user);
    await tx.wait();
    
    console.log("KYC rejected successfully!");
    console.log("Transaction hash:", tx.hash);
  });

task("kyc:pending", "Get pending KYC count")
  .addParam("contract", "The ZamaKYC contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt("ZamaKYC", taskArgs.contract);
    
    const pendingCount = await contract.getPendingKYCCount();
    console.log("Pending KYC applications:", pendingCount.toString());
  });

task("kyc:list", "List all registered users")
  .addParam("contract", "The ZamaKYC contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractAt("ZamaKYC", taskArgs.contract);
    
    const users = await contract.getAllRegisteredUsers();
    console.log("Registered users:");
    for (const user of users) {
      const [status, timestamp] = await contract.getKYCStatus(user);
      const statusText = ["Pending", "Verified", "Rejected"][status];
      console.log(`${user}: ${statusText} (${new Date(Number(timestamp) * 1000).toLocaleDateString()})`);
    }
  });