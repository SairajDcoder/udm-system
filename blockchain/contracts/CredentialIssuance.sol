// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CredentialIssuance {
    struct Credential {
        string studentId;
        string credType;
        string hashId;
        string cid;
        address issuer;
        uint256 issueDate;
        bool isActive;
    }

    mapping(string => Credential) public credentials;

    event CredentialIssued(string indexed hashId, string studentId, address indexed issuer);

    function issueCredential(
        string memory _studentId,
        string memory _credType,
        string memory _hashId,
        string memory _cid
    ) public {
        require(bytes(credentials[_hashId].hashId).length == 0, "Credential already exists");

        credentials[_hashId] = Credential({
            studentId: _studentId,
            credType: _credType,
            hashId: _hashId,
            cid: _cid,
            issuer: msg.sender,
            issueDate: block.timestamp,
            isActive: true
        });

        emit CredentialIssued(_hashId, _studentId, msg.sender);
    }

    function verifyCredential(string memory _hashId) public view returns (bool, string memory, address) {
        Credential memory cred = credentials[_hashId];
        return (cred.isActive, cred.cid, cred.issuer);
    }
}
