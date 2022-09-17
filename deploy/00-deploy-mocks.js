const { network } = require("hardhat");
const { developmentChains, DECIMALES, INITIAL_ANSWER } = require("../helper-hadhat-config.js");


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;


    //verifica si la chain es de prueba para hacer el deploy de MockV3Aggregator con informacion de prueba (falsa)
    if (developmentChains.includes(network.name)) {
        log("local network detectada, se usara mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALES, INITIAL_ANSWER],
        })

        log("mocks realizados")
        console.log("-----------------------------------------")

    }
}


module.exports.tags = ["all", "mocks"]