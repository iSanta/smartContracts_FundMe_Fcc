const { network } = require("hardhat");
const { networkConfig, developmentChains, DECIMALES, INITIAL_ANSWER } = require("../helper-hadhat-config.js");
const { verify } = require("../utils/verify.js")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;


    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    //verifica si la chain es de prueba para la addres de MockV3Aggregator, si en efecto es una chain de prueba, este contrato se debio crear en el deploy 00-deploy-mocks, de lo contrario obtendra la informacion real de helper-hardhat-config.js
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }
    else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }


    const args = [ethUsdPriceFeedAddress]

    // mock que es para cuando tenemos codigo que hace llamaods a blockchais no locales, mientras hacemos pruebas locales, realmente simula esa blockchain de manera local
    // deploy del contrato      
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmation || 1,
    })

    //verifica si al chain es de prueba para hacer el verify de contrato
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args);
    }

    console.log("-----------------------------------------")

}

module.exports.tags = ["all", "fundme"]