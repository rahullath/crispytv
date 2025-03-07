// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VideoPlatform is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Video {
        string title;
        string description;
        string category;
        string ipfsHash;
        string thumbnailHash;
        string streamUrl;
        address author;
        uint256 createdAt;
        uint256 views;
        uint256 likes;
        uint256 dislikes;
        bool isProcessed;
        address processedBy;
        uint256 processedAt;
    }

    struct WatchlistItem {
        uint256 videoId;
        address user;
        uint256 addedAt;
    }

    // Mapping from video ID to Video struct
    mapping(uint256 => Video) public videos;
    
    // Mapping from user address to their watchlist
    mapping(address => mapping(uint256 => bool)) public userWatchlist;
    
    // Array of watchlist items for a user
    mapping(address => uint256[]) public userWatchlistItems;
    
    // Mapping from video ID to array of users who liked it
    mapping(uint256 => mapping(address => bool)) public userLikes;
    
    // Mapping from video ID to array of users who disliked it
    mapping(uint256 => mapping(address => bool)) public userDislikes;

    event VideoCreated(uint256 indexed videoId, address indexed author);
    event VideoProcessed(uint256 indexed videoId, address indexed processor);
    event AddedToWatchlist(uint256 indexed videoId, address indexed user);
    event RemovedFromWatchlist(uint256 indexed videoId, address indexed user);
    event VideoLiked(uint256 indexed videoId, address indexed user);
    event VideoDisliked(uint256 indexed videoId, address indexed user);

    constructor() ERC721("VideoPlatform", "VIDEO") {}

    function createVideo(
        string memory title,
        string memory description,
        string memory category,
        string memory ipfsHash,
        string memory thumbnailHash
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newVideoId = _tokenIds.current();

        _mint(msg.sender, newVideoId);

        videos[newVideoId] = Video({
            title: title,
            description: description,
            category: category,
            ipfsHash: ipfsHash,
            thumbnailHash: thumbnailHash,
            streamUrl: "",
            author: msg.sender,
            createdAt: block.timestamp,
            views: 0,
            likes: 0,
            dislikes: 0,
            isProcessed: false,
            processedBy: address(0),
            processedAt: 0
        });

        emit VideoCreated(newVideoId, msg.sender);
        return newVideoId;
    }

    function processVideo(uint256 videoId, string memory streamUrl) public {
        require(_exists(videoId), "Video does not exist");
        require(!videos[videoId].isProcessed, "Video already processed");

        Video storage video = videos[videoId];
        video.isProcessed = true;
        video.streamUrl = streamUrl;
        video.processedBy = msg.sender;
        video.processedAt = block.timestamp;

        emit VideoProcessed(videoId, msg.sender);
    }

    function addToWatchlist(uint256 videoId) public {
        require(_exists(videoId), "Video does not exist");
        require(!userWatchlist[msg.sender][videoId], "Already in watchlist");

        userWatchlist[msg.sender][videoId] = true;
        userWatchlistItems[msg.sender].push(videoId);

        emit AddedToWatchlist(videoId, msg.sender);
    }

    function removeFromWatchlist(uint256 videoId) public {
        require(_exists(videoId), "Video does not exist");
        require(userWatchlist[msg.sender][videoId], "Not in watchlist");

        userWatchlist[msg.sender][videoId] = false;
        
        // Remove from userWatchlistItems array
        uint256[] storage items = userWatchlistItems[msg.sender];
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i] == videoId) {
                items[i] = items[items.length - 1];
                items.pop();
                break;
            }
        }

        emit RemovedFromWatchlist(videoId, msg.sender);
    }

    function likeVideo(uint256 videoId) public {
        require(_exists(videoId), "Video does not exist");
        require(!userLikes[videoId][msg.sender], "Already liked");

        if (userDislikes[videoId][msg.sender]) {
            videos[videoId].dislikes--;
            userDislikes[videoId][msg.sender] = false;
        }

        videos[videoId].likes++;
        userLikes[videoId][msg.sender] = true;

        emit VideoLiked(videoId, msg.sender);
    }

    function dislikeVideo(uint256 videoId) public {
        require(_exists(videoId), "Video does not exist");
        require(!userDislikes[videoId][msg.sender], "Already disliked");

        if (userLikes[videoId][msg.sender]) {
            videos[videoId].likes--;
            userLikes[videoId][msg.sender] = false;
        }

        videos[videoId].dislikes++;
        userDislikes[videoId][msg.sender] = true;

        emit VideoDisliked(videoId, msg.sender);
    }

    function incrementViews(uint256 videoId) public {
        require(_exists(videoId), "Video does not exist");
        videos[videoId].views++;
    }

    function getVideo(uint256 videoId) public view returns (Video memory) {
        require(_exists(videoId), "Video does not exist");
        return videos[videoId];
    }

    function getUserWatchlist(address user) public view returns (uint256[] memory) {
        return userWatchlistItems[user];
    }

    function hasUserLiked(uint256 videoId, address user) public view returns (bool) {
        return userLikes[videoId][user];
    }

    function hasUserDisliked(uint256 videoId, address user) public view returns (bool) {
        return userDislikes[videoId][user];
    }

    function isInWatchlist(uint256 videoId, address user) public view returns (bool) {
        return userWatchlist[user][videoId];
    }
} 