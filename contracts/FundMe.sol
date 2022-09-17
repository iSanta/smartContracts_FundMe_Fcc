// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

//estos errores gastan menos gas que cadenas de texto dentro del contrato
//de igual manera se recomienda usar getters con la palabra view en vez de llamar las variables creo que ambos casos gastan menos gas, pero sera mejor para la lectura de todos los scripts relacionados
error FundMe_NotOwner();

/** @title ejemplo de contrato para donaciones
 * @author Santa
 * @notice este contrato es una demo simple para aprendizaje
 * @dev este contrato implementa precios reales del mercado
 *
 */
contract FundMe {
    using PriceConverter for uint256;

    //uint256 public minimumUsd = 50 * 1e18;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;

        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //payable es necesaria para las funciones que se destinaran a realizar transacciones
    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );

        //cuando el require da negativo hace un revert, todo el codigo anterior a este dentro de la misma funcion se revertira, pero aun asi gastara gas, el gas usado para todo lo anteior al revert, no lo posterior ya que nunca llegara hasta alli
        //require(msg.value.gerConversionRate() >= minimumUsd, "no se envio el suficiente dinero"); //1e18 == 1 * 10 ** 18 == 1000000000000000000 == 1 ethereum
        //msg.value.gerConversionRate() en las librerias el objeto al cual se el esta aplicando el metodo es considerado su primer parametro
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 founderIndex = 0;
            founderIndex < funders.length;
            founderIndex++
        ) {
            address funder = funders[founderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        //tres tipode formas de hacer una trasnferencia
        //transfer
        //payable(msg.sender).transfer(address(this).balance);

        //send
        //bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //require(sendSuccess, "error al hacer send");

        //call
        (
            bool callSuccess, /*bytes memory dataReturned*/

        ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "error al hacer call");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory fundersLocal = funders;
        //mapping no puede estar en mamory
        for (
            uint256 funderindex = 0;
            funderindex < fundersLocal.length;
            funderindex++
        ) {
            address funder = funders[funderindex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // ejemplo de modificador
    modifier onlyOwner() {
        //require(msg.sender == i_owner, "sender is not owner");
        if (msg.sender != i_owner) {
            revert FundMe_NotOwner();
        }
        _; // esto representa al resto del codigo en la funcion con el modificador en este caso hara la linea de arriba y cuando lo haga, hara todo lo demas
    }

    //si se hace un llamado a este contrato con algun tipo de informacion y este no es reconocido por el contrato, lo redirigira a found
    fallback() external payable {
        fund();
    }

    //si se hace un llamado a este contrato sin ningun tipo de informacion, lo redirigira a found
    receive() external payable {
        fund();
    }
}
