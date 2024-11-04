import { Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import {generateAccessToken,generateRefreshToken,generateResetToken} from '../utils/jwt.token'
import encryption from '../utils/encryption';
import User from '../models/user.model';
import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';
import { Op } from 'sequelize';
import uploadOnCloudinary from '../utils/cloudinary';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

 //Register
 export const registerUser = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
     const{email,password,userName} = req.body;
     if(!email || !password || !userName) {
         return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
     }
     try {
        const existingUser = await db.User.findOne({
            where: {
                [Op.or]: [{email}, {userName}]
            }
        });

        if(existingUser) {
            return next(new ApiError(400,ERROR_MESSAGE.USER_ALREADY_EXISTS));
        }

        const newUser = await db.User.create({
            userName,
            email,
            password
     });

     const response = new ApiResponse(201,newUser,SUCCESS_MESSAGE.USER_REGISTERED_SUCCESSFULLY);
     res.status(201).json(response);
 } catch(error) {
    console.error(error);
     return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
 }
 });


 //Login
 export const loginUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {email,password,role} = req.body;
  
    if (!email || !password) {
      return next(new ApiError(400, ERROR_MESSAGE.EMAIL_AND_PASSWORD_REQUIRED));
    }
  
    try {
      const user = await db.User.findOne({where: {email}});
      if(!user)
      {
          return next(new ApiError(404, ERROR_MESSAGE.USER_NOT_FOUND)); 
      }
   
      const isMatch = await bcrypt.compare(password,user.password);
      if (!isMatch) {
          return next(new ApiError(401, ERROR_MESSAGE.INVALID_CREDENTIALS));
        };

        await db.AccessToken.destroy({
            where: {
                userId: user.id,
                tokenType: 'ACCESS'
            }
        })
         
      const accessToken = generateAccessToken({userId:user.id,email:user.email});
      const refreshToken = generateRefreshToken({ userId: user.id });
      
      const encryptedAccessToken = encryption.encryptWithAES(accessToken);
      const encryptedRefreshToken = encryption.encryptWithAES(refreshToken);
  
      await db.AccessToken.bulkCreate([
          {
              tokenType: 'ACCESS',
              token: encryptedAccessToken,
              userId: user.id,
              expiredAt: new Date(Date.now() + 60 * 60 * 1000),
            },
            {
              tokenType: 'REFRESH',
              token: encryptedRefreshToken,
              userId: user.id,
              expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
      ]);
      const response = new ApiResponse(201,{accessToken,user},SUCCESS_MESSAGE.USER_LOGIN_SUCCESSFULLY);
      res.status(200).send(response);
    } catch(error) {
      console.error(ERROR_MESSAGE.SOMETHING_ERROR, error);
      return next(new ApiError(500, ERROR_MESSAGE.INTERNAL_SERVER_ERROR, [error]));
    }
})


//Logout
export const logout  = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const token = req.token;
    if(!token) {
     return next(new ApiError(401,ERROR_MESSAGE.TOKEN_NOT_FOUND));
    }
    
    try {

        const encryptedToken = encryption.encryptWithAES(token);
  
     const  deleteToken = await db.AccessToken.destroy({
         where: {
             token:encryptedToken,
             tokenType: 'ACCESS'
         }
     });
 
     if(deleteToken == 0) {
         return next(new ApiError(401,ERROR_MESSAGE.TOKEN_NOT_FOUND));
     }
 
     await db.AccessToken.destroy({
         where: {
             userId: req.user?.id,
             tokenType: 'REFRESH'
         }
     });
 
  const response = new ApiResponse(200,SUCCESS_MESSAGE.USER_LOGOUT_SUCCESSFULLY);
   res.status(200).json(response);
 
    }catch (error) {
     console.error(ERROR_MESSAGE.SOMETHING_ERROR);
     return next(new ApiError(500,ERROR_MESSAGE.SOMETHING_ERROR));
    }
 });

//upload profile
export const uploadProfile = asyncHandler(async (req:MyUserRequest,res: Response, next: NextFunction)=> {
const profileImage = req.file?.path;
console.log("profileImage",profileImage);
const user = req.user;
console.log(user);
if(!user) {
    return next(new ApiError(400,ERROR_MESSAGE.RECIPIENT_USER_NOT_FOUND));
}
if(!profileImage) {
    return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
}
try {
    const profile = await uploadOnCloudinary(profileImage);
    if(!profile || !profile.url) {
        return next(new ApiError(400,ERROR_MESSAGE.PROFILE_UPLOAD_FAILED))
    }
    user.profileImage = profile.url;
    await user.save();
     res.status(201).json({message:SUCCESS_MESSAGE.PROFILE_UPLOAD_SUCCESSFULLY});

} catch(error) {
    console.error(error);
    return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
}
});



