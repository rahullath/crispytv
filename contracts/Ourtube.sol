//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Importing Console.sol from the hardhat console library
import "hardhat/console.sol";

contract Ourtube {
    // State variable
    uint256 public videoCount = 0;
    // Contract owner
    string public name = "Torvy Contract";
    mapping(uint256 => Video) public videos;

    struct Video {
        uint256 id;
        string hash;
        string title;
        string description;
        string location;
        string category;
        string thumbnailHash;
        bool isAudio;
        string date;
        address author;
    }

    event VideoUploaded(
        uint256 id,
        string hash,
        string title,
        string description,
        string location,
        string category,
        string thumbnailHash,
        bool isAudio,
        string date,
        address author
    );

    constructor() {
        console.log("Deploying Torvy");
    }

    function uploadVideo(
        string memory _videoHash,
        string memory _title,
        string memory _description,
        string memory _location,
        string memory _category,
        string memory _thumbnailHash,
        bool _isAudio,
        string memory _date
    ) public {
        // Validating
        require(bytes(_videoHash).length > 0);
        require(bytes(_title).length > 0);
        require(msg.sender != address(0));

        videoCount++;
        videos[videoCount] = Video(
            videoCount,
            _videoHash,
            _title,
            _description,
            _location,
            _category,
            _thumbnailHash,
            _isAudio,
            _date,
            msg.sender
        );
        emit VideoUploaded(
            videoCount,
            _videoHash,
            _title,
            _description,
            _location,
            _category,
            _thumbnailHash,
            _isAudio,
            _date,
            msg.sender
        );
    }
}