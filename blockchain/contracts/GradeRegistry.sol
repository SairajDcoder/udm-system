// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GradeRegistry {
    struct Grade {
        string studentId;
        string courseId;
        string term;
        string cid;
        address faculty;
        uint256 timestamp;
    }

    mapping(string => Grade) public grades;

    event GradeLogged(string indexed studentId, string courseId, string cid, address indexed faculty);

    function logGrade(string memory _studentId, string memory _courseId, string memory _term, string memory _cid) public {
        grades[_cid] = Grade({
            studentId: _studentId,
            courseId: _courseId,
            term: _term,
            cid: _cid,
            faculty: msg.sender,
            timestamp: block.timestamp
        });

        emit GradeLogged(_studentId, _courseId, _cid, msg.sender);
    }
}
