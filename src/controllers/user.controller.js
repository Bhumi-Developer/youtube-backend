const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const User = require("../models/user.model")
const uploadCloudinary = require("../utils/cloudinary")
const ApiResponse = require("../utils/ApiResponse")

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken =  refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something is off")
    }
}

const registerUser = asyncHandler(async(req,res)=> {
   const {fullname,email,username,password} = req.body
  
    if([fullname,email,username, password].some((field)=>field?.trim() === "")){
        throw new ApiError(400, "full name is required")
    }
   

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"user exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar is required")
    }

   const avatar= await uploadCloudinary(avatarLocalPath)
   const coverImage= await uploadCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar is required")
   }

   const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500,"wrong")
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered")
   )
})
const loginUser = asyncHandler(async(req,res)=> {
    const {email,username,password} = req.body

    if(!username && ! email){
        throw new ApiError(400,"not exists")
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"not registered")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
    const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id) 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },{
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "user logged out"))
})
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefershToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefershToken){
        throw new ApiError(401,"unauthoried access")
    }
    const decordedToken = JsonWebTokenError.verify(
        incomingRefershToken,
        process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decordedToken?._id)
    if(!user){
        throw new ApiError(401,"invalid refersh token")
    }
    if(incomingRefershToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh Token is expired or used")
    }
    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    )
})
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Password changed'))
})
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched")
})
const updateDetails = asyncHandler(async(req,res)=>{
    const{username,fullname} = req.body
    if(!username || ! fullname){
        throw new ApiError(400,"please enter full entries")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"Updated"))
})
const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is reqd")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"error while uploading")
    }
    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
                }
        },
        {new: true}
    ).select("-password")
    return res.status(200)
    .json(new ApiResponse(200,user,"Updated"))
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateDetails,
    updateUserAvatar
  }
  