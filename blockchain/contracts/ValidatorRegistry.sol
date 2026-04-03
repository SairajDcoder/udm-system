// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ValidatorRegistry {
    struct Validator {
        address wallet;
        string name;
        uint256 stake;
        bool isActive;
    }

    mapping(address => Validator) public validators;

    event ValidatorAdded(address indexed wallet, string name, uint256 stake);

    function addValidator(address _wallet, string memory _name, uint256 _stake) public {
        require(!validators[_wallet].isActive, "Validator is already active");
        validators[_wallet] = Validator({
            wallet: _wallet,
            name: _name,
            stake: _stake,
            isActive: true
        });
        emit ValidatorAdded(_wallet, _name, _stake);
    }
}
