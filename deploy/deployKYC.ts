import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedZamaKYC = await deploy("ZamaKYC", {
    from: deployer,
    log: true,
  });

  console.log(`ZamaKYC contract deployed at: `, deployedZamaKYC.address);
  console.log(`Owner address: `, deployer);
};

export default func;
func.id = "deploy_zamakyc";
func.tags = ["ZamaKYC"];