// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AuditLogger {
    struct LogEntry {
        address actor;
        string action;
        string targetType;
        string targetId;
        string detailsCid;
        uint256 timestamp;
    }

    LogEntry[] public logs;

    event LogCreated(uint256 indexed logId, address indexed actor, string action);

    function createLog(string memory _action, string memory _targetType, string memory _targetId, string memory _detailsCid) public {
        logs.push(LogEntry({
            actor: msg.sender,
            action: _action,
            targetType: _targetType,
            targetId: _targetId,
            detailsCid: _detailsCid,
            timestamp: block.timestamp
        }));
        emit LogCreated(logs.length - 1, msg.sender, _action);
    }

    function getLogsCount() public view returns (uint256) {
        return logs.length;
    }
}
