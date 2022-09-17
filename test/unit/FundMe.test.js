const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");


!developmentChains.includes(network.name) ? describe.skip :
    describe("FundMe", async function () {
        let fundMe
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther("1")// 1 ETH

        //aqui se optendran los contratos con los cuales se hara la prueba
        beforeEach(async function () {
            //const accounts = await ethers.getSigners(); // para obtener cuenta de la network que estemos ejecutando (hardhat.config.js) 
            //const accountzero = accounts[0]

            //obtiene la cuenta de prueba o real que se dicte en hardhat.config.js dependiendo la network
            deployer = (await getNamedAccounts()).deployer

            //await deployments.fixture(["all"])
            //aqui se ejecutan los scrips de la carpeta deploy, todos lo que tengan la tag all
            await deployments.fixture(["all"])

            //getContract trae el ultimo contrato ejecutado de el tipo enviado en el parametro, con este se haran las pruebas
            //en este caso el contrato fundme creado en el deployments.fixture
            fundMe = await ethers.getContract("FundMe", deployer)

            //en este caso el MockV3Aggregator fundme creado en el deployments.fixture
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
            console.log("beforeEach")


        })


        //prueba del constructor del contrato
        describe("constructor", async function () {

            it("La address del MockV3Aggregator corresponde a la usada en FundMe", async function () {
                const response = await fundMe.priceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })

        })

        //prueba de la funcion fund del contrato
        describe("fund", async function () {
            it("falla al no enviar la cantidad minima permitida por el contrato de ETH", async function () {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
            })
            it("prueba del map addressToAmountFunded que relaciona address con cantidad enviada", async function () {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.addressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })
            it("actualiza el array de funders al enviar una cantidad correcta de ETH", async function () {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.funders(0)
                assert.equal(response, deployer)
            })


        })

        //prueba de la funcion withdraw del contrato
        describe("withdraw", async function () {
            beforeEach(async function () {
                await fundMe.fund({ value: sendValue })
            })

            it("retirar dinero luego de la primera donacion", async function () {
                const startingFoundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFoundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
            })

            it("retirar dinero luego de varias donacion", async function () {
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    //fundMe.Connect es para conectar destintos address, dado que fundMe cuando lo creamos, lo creamos con el deployer, asi que fundMe.Connect nos permite desconcectar esa addres y conectar otra para realizar mas acciones
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])

                    await fundMeConnectedContract.fund({ value: sendValue })
                }

                const startingFoundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFoundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

                //asegurarse de que el array de funders vuelve a estar vacio

                await expect(fundMe.funders(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
                }
            })

            it("solo el owner puede retirar el dinero", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe_NotOwner")
            })

            it("retirar dinero luego de varias donacion usando la funcion cheaper", async function () {
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    //fundMe.Connect es para conectar destintos address, dado que fundMe cuando lo creamos, lo creamos con el deployer, asi que fundMe.Connect nos permite desconcectar esa addres y conectar otra para realizar mas acciones
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])

                    await fundMeConnectedContract.fund({ value: sendValue })
                }

                const startingFoundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFoundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

                //asegurarse de que el array de funders vuelve a estar vacio

                await expect(fundMe.funders(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
                }
            })
        })
    })