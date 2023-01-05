// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IERC20.sol";

/// @notice Escrow for ETH and ERC-20/721 tokens
/// @notice WIP
/// todo
//  1. refine ETH transfer codes
//      a. use openzepplin interface
//  2. function access
//  3. is recovery details needed?
contract PactXEscrow {
    address public resolver;
    address immutable wETH;
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant INVOICE_HASH = keccak256("DepositInvoiceSig(address contractToken, address tokenOwner, address serviceProvider)");

    mapping(uint256 => Escrow) public escrows;

    constructor(address _resolver, address _wETH) {
        resolver = _resolver;
        wETH = _wETH;

    DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("PactXEscrow")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /// @dev Events to assist web3 applications.
    event InitialDeposit(
        uint256 indexed tokenId,
        address indexed tokenOwner,
        address indexed serviceProvider,
        IERC20 fund,
        uint256 depositValue
    );
    event RoyaltyDeposit(
        uint256 indexed tokenId,
        address indexed tokenOwner,
        address indexed serviceProvider,
        IERC20 fund,
        uint256 depositValue,
        uint256 totalValue
    );

    event DepositInvoiceSig(uint256 indexed tokenId, address indexed tokenOwner, address indexed serviceProvider);
    event Froze(uint256 indexed tokenId);
    event Unfrozen(uint256 indexed tokenId);
    event Release(uint256 indexed tokenId);
    event Withdraw(uint256 indexed tokenId);
    event Resolve(uint256 indexed tokenId, bool indexed awardToServiceProvider);

    /// @dev Tracks escrow status.
    struct Escrow {
        address contractTokenOwner;
        address serviceProvider;
        uint256 totalValue;
        uint256 termination; // need a way to get the termination date from contract token
        IERC20 fund;
        bool frozen;
    }


    /// @dev Access control modifier that conditions function to be restricted to resolver
    modifier onlyResolver() {
        require(msg.sender == resolver, "NOT_RESOLVER");
        _;
    }

    // **** ESCROW PROTOCOL **** //
    // ------------------------ //
    /// @notice msg.sender / buyer may require further adjustment
    // ------------------------ //
    function initialDeposit(
        uint256 tokenId,
        address serviceProvider,
        // address buyer, //should invlude buyer if the function can only called by the admin
        IERC20 buyerFund,
        uint256 depositValue,
        uint256 termination
    ) external payable {
        require(escrows[tokenId].serviceProvider == address(0), "ESCROW_ALREADY_EXIST");

        if (address(buyerFund) == address(0)) {
            // is this valid for our use case?
            require(msg.value == depositValue, "WRONG_MSG_VALUE");
        } else {
            buyerFund.transferFrom(msg.sender, address(this), depositValue);
        }
        escrows[tokenId] = Escrow(msg.sender, serviceProvider, depositValue, termination, buyerFund, false);

        emit InitialDeposit(tokenId, msg.sender, serviceProvider, buyerFund, depositValue);
    }

    function changeResolver(address newResolver) external onlyResolver {
        resolver = newResolver;
    }

    function royaltyDeposit(
        uint256 tokenId,
        address serviceProvider,
        // address buyer, //should invlude buyer if the function can only called by the admin
        IERC20 buyerFund,
        uint256 depositValue
    ) external payable {
        require(escrows[tokenId].serviceProvider != address(0), "ESCROW_NOT_EXIST");
        require(escrows[tokenId].serviceProvider == serviceProvider, "SERVICE_PROVIDER_NOT_MATCH");

        // trying to follow what lexDao but buyerFund part is slightly -> need clarification 
        /// @dev please refer to https://github.com/lexDAO/LexCorpus/blob/master/contracts/escrow/LexEscrowSimple.sol
        Escrow storage curr_escrow = escrows[tokenId];
        if (address(buyerFund) == address(0)) {
            require(msg.value == depositValue, "WRONG_MSG_VALUE");
        } else {
            buyerFund.transferFrom(msg.sender, address(this), depositValue);
        }
        curr_escrow.totalValue += depositValue;
        curr_escrow.contractTokenOwner = msg.sender;

        emit RoyaltyDeposit(tokenId, msg.sender, serviceProvider, buyerFund, depositValue, curr_escrow.totalValue);
    }

    // function depositInvoiceSig() external payable {}
    // mainly to generate an invoice and the recovery details

    // **** SETTLEMENT PROTOCOL **** //
    // ------------------------ //
    function release(
        uint256 tokenId
    ) external onlyResolver {
        require(escrows[tokenId].serviceProvider != address(0), "ESCROW_NOT_EXIST");
        require(escrows[tokenId].frozen == false, "CANNOT_RELEASE_FROZEN_ESCROW");
        Escrow storage curr_escrow = escrows[tokenId];

        if (address(curr_escrow.fund) == address(0)) {
            (bool success, ) = curr_escrow.serviceProvider.call{value: curr_escrow.totalValue}("");
            require(success, "ETH_TRANSFER_FAILED");
        } else {
            curr_escrow.fund.transfer(curr_escrow.serviceProvider, curr_escrow.totalValue);
        }

        emit Release(tokenId);
    }

    // **** DISPUTE PROTOCOL **** //
    // ------------------------ //
    function freeze(uint256 tokenId) external onlyResolver {
        require(escrows[tokenId].serviceProvider != address(0), "ESCROW_NOT_EXIST");
        Escrow storage curr_escrow = escrows[tokenId];
        if (curr_escrow.frozen == false) {
            curr_escrow.frozen = true;
            emit Froze(tokenId);
        }
    }

    function unfreeze(uint256 tokenId) external onlyResolver {
        require(escrows[tokenId].serviceProvider != address(0), "ESCROW_NOT_EXIST");
        Escrow storage curr_escrow = escrows[tokenId];
        if (curr_escrow.frozen == true) {
            curr_escrow.frozen = false;
            emit Unfrozen(tokenId);
        }
    }

    function resolve(uint256 tokenId, bool awardToServiceProvider) external onlyResolver {
        require(escrows[tokenId].serviceProvider != address(0), "ESCROW_NOT_EXIST");
        require(escrows[tokenId].frozen == true, "CANNOT_RESOLVE_UNFROZEN_ESCROW");
        Escrow storage curr_escrow = escrows[tokenId];
        if (awardToServiceProvider) {
            if (address(curr_escrow.fund) == address(0)) {
            (bool success, ) = curr_escrow.serviceProvider.call{value: curr_escrow.totalValue}("");
                require(success, "ETH_TRANSFER_FAILED");
            } else {
                curr_escrow.fund.transfer(curr_escrow.serviceProvider, curr_escrow.totalValue);
            }

        } else {
            if (address(curr_escrow.fund) == address(0)) {
            (bool success, ) = curr_escrow.contractTokenOwner.call{value: curr_escrow.totalValue}("");
                require(success, "ETH_TRANSFER_FAILED");
            } else {
                curr_escrow.fund.transfer(curr_escrow.contractTokenOwner, curr_escrow.totalValue);
            }

        }
        emit Resolve(tokenId, awardToServiceProvider);
    }

    // **** EXPIRY WITHDRAW PROTOCOL **** //
    // ------------------------ //
    function withdraw(uint256 tokenId) external {
        require(escrows[tokenId].serviceProvider != address(0), "ESCROW_NOT_EXIST");
        require(escrows[tokenId].frozen == false, "CANNOT_WITHDRAW_FROZEN_ESCROW");
        require(escrows[tokenId].termination <= block.timestamp, "CANNOT_WITHDRAW_BEFORE_TERMINATION");

        Escrow storage curr_escrow = escrows[tokenId];
        if (address(curr_escrow.fund) == address(0)) {
        (bool success, ) = curr_escrow.serviceProvider.call{value: curr_escrow.totalValue}("");
            require(success, "ETH_TRANSFER_FAILED");
        } else {
            curr_escrow.fund.transfer(curr_escrow.serviceProvider, curr_escrow.totalValue);
        }

        emit Withdraw(tokenId);

    }

    // **** HELPER FUNCTIONS **** //
    // ------------------------ //
    function getTermination(uint256 tokenId) external view returns (uint256){
        Escrow storage curr_escrow = escrows[tokenId];
        return curr_escrow.termination;
    }

    function getTotalValue(uint256 tokenId) external view  returns (uint256){
        Escrow storage curr_escrow = escrows[tokenId];
        return curr_escrow.totalValue;
    }

    function getIfFroze(uint256 tokenId) external view  returns (bool){
        Escrow storage curr_escrow = escrows[tokenId];
        return curr_escrow.frozen;
    }

    function getContractOwner(uint256 tokenId) external view  returns (address){
        Escrow storage curr_escrow = escrows[tokenId];
        return curr_escrow.contractTokenOwner;
    }

    function getServiceProvider(uint256 tokenId) external view  returns (address){
        Escrow storage curr_escrow = escrows[tokenId];
        return curr_escrow.serviceProvider;
    }
}