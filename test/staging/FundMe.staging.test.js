const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hadhat-config.js")


developmentChains.includes(network.name) ? describe.skip :
    describe("Fundme", async function () {
        let fundMe;
        let deployer;
        const sendValue = ethers.utils.parseEther("1")// 1 ETH

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })
        it("permite que la gente haga donaciones y retiros", async function () {
            await fundMe.fund({ value: sendValue })
            await fundMe.cheaperWithdraw()
            const endingBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingBalance.toString(), "0")
        })
    })