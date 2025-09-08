import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { ZamaKYC } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("ZamaKYC", function () {
  let zamaKYC: ZamaKYC;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const ZamaKYCFactory = await ethers.getContractFactory("ZamaKYC");
    zamaKYC = await ZamaKYCFactory.deploy();
    await zamaKYC.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await zamaKYC.owner()).to.equal(owner.address);
    });
  });

  describe("KYC Submission", function () {
    it("Should allow user to submit KYC information", async function () {
      const input = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user1.address);
      input.add256(BigInt("123456789012345678901234567890")); // document hash
      input.add32(1001);  // name as number
      input.add32(86);    // nationality (China)
      input.add32(1990);  // birth year
      const encryptedInput = await input.encrypt();

      await zamaKYC.connect(user1).submitKYC(
        encryptedInput.handles[0],
        encryptedInput.handles[1], 
        encryptedInput.handles[2],
        encryptedInput.handles[3],
        encryptedInput.inputProof
      );

      expect(await zamaKYC.hasKYCRecord(user1.address)).to.be.true;
      
      const [status, timestamp] = await zamaKYC.getKYCStatus(user1.address);
      expect(status).to.equal(0); // Pending
      expect(timestamp).to.be.gt(0);
    });

    it("Should not allow duplicate KYC submission", async function () {
      const input = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user1.address);
      input.add256(BigInt("123456789012345678901234567890"));
      input.add32(1001);
      input.add32(86);
      input.add32(1990);
      const encryptedInput = await input.encrypt();

      await zamaKYC.connect(user1).submitKYC(
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.handles[2], 
        encryptedInput.handles[3],
        encryptedInput.inputProof
      );

      const input2 = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user1.address);
      input2.add256(BigInt("987654321098765432109876543210"));
      input2.add32(1002);
      input2.add32(156);
      input2.add32(1985);
      const encryptedInput2 = await input2.encrypt();

      await expect(
        zamaKYC.connect(user1).submitKYC(
          encryptedInput2.handles[0],
          encryptedInput2.handles[1],
          encryptedInput2.handles[2],
          encryptedInput2.handles[3],
          encryptedInput2.inputProof
        )
      ).to.be.revertedWith("KYC already submitted");
    });
  });

  describe("KYC Verification", function () {
    beforeEach(async function () {
      const input = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user1.address);
      input.add256(BigInt("123456789012345678901234567890"));
      input.add32(1001);
      input.add32(86);
      input.add32(1990);
      const encryptedInput = await input.encrypt();

      await zamaKYC.connect(user1).submitKYC(
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.handles[2],
        encryptedInput.handles[3],
        encryptedInput.inputProof
      );
    });

    it("Should allow owner to verify KYC", async function () {
      await zamaKYC.connect(owner).verifyKYC(user1.address);
      
      const [status] = await zamaKYC.getKYCStatus(user1.address);
      expect(status).to.equal(1); // Verified
      
      expect(await zamaKYC.isKYCVerified(user1.address)).to.be.true;
    });

    it("Should allow owner to reject KYC", async function () {
      await zamaKYC.connect(owner).rejectKYC(user1.address);
      
      const [status] = await zamaKYC.getKYCStatus(user1.address);
      expect(status).to.equal(2); // Rejected
      
      expect(await zamaKYC.isKYCVerified(user1.address)).to.be.false;
    });

    it("Should not allow non-owner to verify KYC", async function () {
      await expect(
        zamaKYC.connect(user2).verifyKYC(user1.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should not allow verification of already verified KYC", async function () {
      await zamaKYC.connect(owner).verifyKYC(user1.address);
      
      await expect(
        zamaKYC.connect(owner).verifyKYC(user1.address)
      ).to.be.revertedWith("KYC is not in pending status");
    });
  });

  describe("Owner Management", function () {
    it("Should allow owner to transfer ownership", async function () {
      await zamaKYC.connect(owner).transferOwnership(user1.address);
      expect(await zamaKYC.owner()).to.equal(user1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        zamaKYC.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(
        zamaKYC.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("New owner cannot be zero address");
    });
  });

  describe("Utility Functions", function () {
    beforeEach(async function () {
      // Submit KYC for user1
      const input1 = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user1.address);
      input1.add256(BigInt("123456789012345678901234567890"));
      input1.add32(1001);
      input1.add32(86);
      input1.add32(1990);
      const encryptedInput1 = await input1.encrypt();

      await zamaKYC.connect(user1).submitKYC(
        encryptedInput1.handles[0],
        encryptedInput1.handles[1],
        encryptedInput1.handles[2],
        encryptedInput1.handles[3],
        encryptedInput1.inputProof
      );

      // Submit KYC for user2
      const input2 = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user2.address);
      input2.add256(BigInt("987654321098765432109876543210"));
      input2.add32(1002);
      input2.add32(156);
      input2.add32(1985);
      const encryptedInput2 = await input2.encrypt();

      await zamaKYC.connect(user2).submitKYC(
        encryptedInput2.handles[0],
        encryptedInput2.handles[1],
        encryptedInput2.handles[2],
        encryptedInput2.handles[3],
        encryptedInput2.inputProof
      );
    });

    it("Should return correct pending KYC count", async function () {
      const pendingCount = await zamaKYC.getPendingKYCCount();
      expect(pendingCount).to.equal(2);

      await zamaKYC.connect(owner).verifyKYC(user1.address);
      
      const pendingCountAfter = await zamaKYC.getPendingKYCCount();
      expect(pendingCountAfter).to.equal(1);
    });

    it("Should return all registered users", async function () {
      const users = await zamaKYC.getAllRegisteredUsers();
      expect(users).to.have.length(2);
      expect(users).to.include(user1.address);
      expect(users).to.include(user2.address);
    });

    it("Should check KYC record existence", async function () {
      expect(await zamaKYC.hasKYCRecord(user1.address)).to.be.true;
      expect(await zamaKYC.hasKYCRecord(owner.address)).to.be.false;
    });
  });

  describe("Events", function () {
    it("Should emit KYCSubmitted event", async function () {
      const input = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user1.address);
      input.add256(BigInt("123456789012345678901234567890"));
      input.add32(1001);
      input.add32(86);
      input.add32(1990);
      const encryptedInput = await input.encrypt();

      await expect(
        zamaKYC.connect(user1).submitKYC(
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          encryptedInput.handles[2],
          encryptedInput.handles[3],
          encryptedInput.inputProof
        )
      ).to.emit(zamaKYC, "KYCSubmitted")
       .withArgs(user1.address, await ethers.provider.getBlockNumber() + 1);
    });

    it("Should emit KYCStatusChanged event on verification", async function () {
      const input = fhevm.createEncryptedInput(await zamaKYC.getAddress(), user1.address);
      input.add256(BigInt("123456789012345678901234567890"));
      input.add32(1001);
      input.add32(86);
      input.add32(1990);
      const encryptedInput = await input.encrypt();

      await zamaKYC.connect(user1).submitKYC(
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.handles[2],
        encryptedInput.handles[3],
        encryptedInput.inputProof
      );

      await expect(
        zamaKYC.connect(owner).verifyKYC(user1.address)
      ).to.emit(zamaKYC, "KYCStatusChanged")
       .withArgs(user1.address, 0, 1); // Pending to Verified
    });
  });
});