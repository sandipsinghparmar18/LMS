import { asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary,deleteFromCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"

const generateAcessAndRefreshTokens=async(userId)=>{
    try {
        //console.log("userId: ",userId);
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        //console.log("accessToken: ",accessToken)
        //console.log("refreshToken: ",refreshToken)
        user.refreshToken=refreshToken
        await user.save({ validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating the access and refresh token")
    }
}

const register=asyncHandler(async (req,res)=>{
    const {name,email,password}=req.body;
    if(!(name || email || password) ){
        throw new ApiError(400,"All fields are required")
    }
    const existingUser=await User.findOne({email})
    if(existingUser){
        throw new ApiError(400,"Email already exists")
    }
    const user=await User.create({
        name,
        email,
        password
    })
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd SuccessFully")
    )

})

const login=asyncHandler(async (req,res)=>{
    const {email,password}=req.body;
    if(!(password || email) ){
        throw new ApiError(400,"All fields are required")
    }

    const user=await User.findOne({email});
    if(!user) {
        throw new ApiError(404,"User does not find")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credenatial")
    }

    const {accessToken,refreshToken}=await generateAcessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Succesfully"
        )
    )
});

const logout=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    }
)
const options={
    httpOnly:true,
    secure:true
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(
    new ApiResponse(200,{}, "User logged out successfully")
)
})

const getUserProfile=asyncHandler(async (req,res)=>{
    try {
        const user=await User.findById(req.user?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(404,"User not found")
        }
        return res.json(
            new ApiResponse(200,user,"User profile fetched successfully")
        )
    } catch (error) {
        console.error(error);
        throw new ApiError(500,"Something went wrong while fetching user profile")
    }
})

const updateProfile = asyncHandler(async (req, res) => {
    const {email,name}=req.body;
    if(!(email || name)){
        throw new ApiError(400,"field (email or name) is required")
    }
    const profileLocalPath=req.file?.path;
    if(!profileLocalPath){
        throw new ApiError(400,"Profile picture is required")
    }
    const profilePhoto=await uploadOnCloudinary(profileLocalPath);
    if(!profilePhoto){
        throw new ApiError(500,"Something went wrong while uploading profile picture")
    }
    const existingUser=await User.findById(req.user?._id).select("photoUrl");
    const oldProfilePhoto=existingUser?.photoUrl;
    const deleteResponse=await deleteFromCloudinary(oldProfilePhoto);
    console.log(deleteResponse);

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email,
                name,
                photoUrl:profilePhoto.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200,user,"User profile updated successfully")
    )
});




export {
    getUserProfile, 
    login, 
    logout, 
    register, 
    updateProfile
}