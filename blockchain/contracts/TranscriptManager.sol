// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TranscriptManager {
    struct Transcript {
        string studentId;
        string term;
        string cid;
        address issuer;
        uint256 timestamp;
    }

    mapping(string => Transcript) public transcripts;

    event TranscriptLogged(string indexed studentId, string term, string cid, address indexed issuer);

    function logTranscript(string memory _studentId, string memory _term, string memory _cid) public {
        transcripts[_cid] = Transcript({
            studentId: _studentId,
            term: _term,
            cid: _cid,
            issuer: msg.sender,
            timestamp: block.timestamp
        });

        emit TranscriptLogged(_studentId, _term, _cid, msg.sender);
    }
}
