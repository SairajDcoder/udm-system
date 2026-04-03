// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DIDRegistry {
    struct UserDID {
        address walletAddress;
        string did;
        string role;
        string emailHash;
        bool isActive;
    }

    mapping(address => UserDID) public dids;
    mapping(string => address) public didToAddress;

    event DIDRegistered(address indexed wallet, string did, string role);

    function registerDID(string memory _did, string memory _role, string memory _emailHash) public {
        require(!dids[msg.sender].isActive, "DID already registered for this wallet");
        require(didToAddress[_did] == address(0), "DID already exists");

        dids[msg.sender] = UserDID({
            walletAddress: msg.sender,
            did: _did,
            role: _role,
            emailHash: _emailHash,
            isActive: true
        });
        didToAddress[_did] = msg.sender;

        emit DIDRegistered(msg.sender, _did, _role);
    }

    function getDID(address _wallet) public view returns (string memory, string memory, bool) {
        UserDID memory user = dids[_wallet];
        return (user.did, user.role, user.isActive);
    }
}
