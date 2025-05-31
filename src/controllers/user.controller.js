const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const User = require("../models/user.model")
const uploadCloudinary = require("../utils/cloudinary")
const ApiResponse = require("../utils/ApiResponse")

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

module.exports = registerUser