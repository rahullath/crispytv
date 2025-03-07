import { gql } from "@apollo/client";

export const GET_ALL_VIDEOS = gql`
  query videos(
    $first: Int
    $skip: Int
    $orderBy: Video_orderBy
    $orderDirection: OrderDirection
    $where: Video_filter
  ) {
    videos(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      hash
      title
      description
      location
      category
      thumbnailHash
      date
      author
      createdAt
      status
      streamUrl
      duration
      size
      quality
      tags
      views
      likes
      dislikes
      comments {
        id
        text
        author
        createdAt
      }
      processingStatus
      torrentHash
      convertedBy
      convertedAt
    }
  }
`;

export const GET_VIDEO_BY_ID = gql`
  query video($id: ID!) {
    video(id: $id) {
      id
      hash
      title
      description
      location
      category
      thumbnailHash
      date
      author
      createdAt
      status
      streamUrl
      duration
      size
      quality
      tags
      views
      likes
      dislikes
      comments {
        id
        text
        author
        createdAt
      }
      processingStatus
      torrentHash
      convertedBy
      convertedAt
    }
  }
`;

export const GET_VIDEOS_BY_CATEGORY = gql`
  query videosByCategory($category: String!, $first: Int, $skip: Int) {
    videos(
      first: $first
      skip: $skip
      where: { category: $category }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      hash
      title
      description
      location
      category
      thumbnailHash
      date
      author
      createdAt
      status
      streamUrl
      duration
      size
      quality
      tags
      views
      likes
      dislikes
      processingStatus
      torrentHash
      convertedBy
      convertedAt
    }
  }
`;

export const GET_RELATED_VIDEOS = gql`
  query relatedVideos($category: String!, $currentVideoId: ID!, $first: Int) {
    videos(
      first: $first
      where: {
        category: $category
        id_not: $currentVideoId
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      hash
      title
      description
      location
      category
      thumbnailHash
      date
      author
      createdAt
      status
      streamUrl
      duration
      size
      quality
      tags
      views
      likes
      dislikes
      processingStatus
      torrentHash
      convertedBy
      convertedAt
    }
  }
`;

export const GET_USER_WATCHLIST = gql`
  query userWatchlist($userAddress: String!, $first: Int, $skip: Int) {
    watchlist(
      first: $first
      skip: $skip
      where: { user: $userAddress }
      orderBy: addedAt
      orderDirection: desc
    ) {
      id
      video {
        id
        hash
        title
        description
        location
        category
        thumbnailHash
        date
        author
        createdAt
        status
        streamUrl
        duration
        size
        quality
        tags
        views
        likes
        dislikes
        processingStatus
        torrentHash
        convertedBy
        convertedAt
      }
      addedAt
    }
  }
`;

export const GET_VIDEO_PROCESSING_STATUS = gql`
  query videoProcessingStatus($videoId: ID!) {
    video(id: $videoId) {
      id
      processingStatus
      convertedBy
      convertedAt
      streamUrl
    }
  }
`;

export const ADD_TO_WATCHLIST = gql`
  mutation addToWatchlist($videoId: ID!, $userAddress: String!) {
    addToWatchlist(videoId: $videoId, userAddress: $userAddress) {
      id
      video {
        id
        title
      }
      user
      addedAt
    }
  }
`;

export const REMOVE_FROM_WATCHLIST = gql`
  mutation removeFromWatchlist($videoId: ID!, $userAddress: String!) {
    removeFromWatchlist(videoId: $videoId, userAddress: $userAddress) {
      id
    }
  }
`;

export const LIKE_VIDEO = gql`
  mutation likeVideo($videoId: ID!, $userAddress: String!) {
    likeVideo(videoId: $videoId, userAddress: $userAddress) {
      id
      likes
    }
  }
`;

export const DISLIKE_VIDEO = gql`
  mutation dislikeVideo($videoId: ID!, $userAddress: String!) {
    dislikeVideo(videoId: $videoId, userAddress: $userAddress) {
      id
      dislikes
    }
  }
`;
