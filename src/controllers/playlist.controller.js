import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {Playlist} from "../models/playlist.models.js"
import {Video} from "../models/video.models.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: user._id,
    })
    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }
    res.status(201).json(new ApiResponse(playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    //TODO: get user playlists
    const playlist = await Playlist.find({owner: userId})
    if (!playlist) {
        throw new ApiError(404, "No playlists found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "User playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //Todo: add video to playlist
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    const videoExists = playlist.videos.includes(videoId)
    if (videoExists) {
        throw new ApiError(400, "Video already exists in the playlist")
    }
    const video = await Video.findById(videoId).select("-__v -createdAt -updatedAt")    
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    playlist.videos.push(video)
    await playlist.save()   
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    const videoExists = playlist.videos.includes(videoId)
    if (!videoExists) {
        throw new ApiError(400, "Video does not exist in the playlist")
    }
    playlist.videos = playlist.videos.pull(videoId);
    await playlist.save()   
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    // TODO: delete playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name, 
            description
        },
        {
            new: true
        }
    )
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}