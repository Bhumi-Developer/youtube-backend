const asyncHandler = require("../utils/asyncHandler")
// const env = require("./.env")
const ApiError = require("../utils/ApiError")
const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
    // req.cookies.refreshToken
    if(!token){
        throw new ApiError(402,"Unauthorised request")
    }
    const decordedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decordedToken?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401,"Invalid access")
    }
    req.user = user;
    next()
   } catch (error) {
    throw new ApiError(401,"wrong")
   }
})

module.exports = verifyJWT