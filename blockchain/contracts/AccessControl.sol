// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AccessControlRegistry {
    struct AccessGrant {
        string studentId;
        string verifierEmail;
        string recordType;
        uint256 expiryDate;
        bool active;
    }

    mapping(string => AccessGrant) public grants;

    event AccessGranted(string indexed grantId, string studentId, string verifierEmail);
    event AccessRevoked(string indexed grantId, string studentId);

    function grantAccess(string memory _grantId, string memory _studentId, string memory _verifierEmail, string memory _recordType, uint256 _expiry) public {
        grants[_grantId] = AccessGrant({
            studentId: _studentId,
            verifierEmail: _verifierEmail,
            recordType: _recordType,
            expiryDate: _expiry,
            active: true
        });

        emit AccessGranted(_grantId, _studentId, _verifierEmail);
    }

    function revokeAccess(string memory _grantId) public {
        require(grants[_grantId].active, "Grant is already inactive");
        grants[_grantId].active = false;
        
        emit AccessRevoked(_grantId, grants[_grantId].studentId);
    }
}
