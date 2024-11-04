import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import User from '../models/user.model';
import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
}

//tagging a user in post
export const tagUser = asyncHandler(async(req: MyUserRequest, res: Response, next: NextFunction) => {
  
    const user = req.user;
    const {postId,taggedUserId } = req.body;
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }
    
    if(!postId || !taggedUserId) {
        return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
    }

    try {
        const existingTag  = await db.UserTag.findOne({
            where: {
                postId,
                userId: taggedUserId
            }
        });
        if(existingTag) {
            return next(new ApiError(400,ERROR_MESSAGE.USER_ALREADY_TAGGED));
        }

        const userTag = await db.UserTag.create({
            postId,
            userId: taggedUserId
        });
    const response = new ApiResponse(201, {userTag},SUCCESS_MESSAGE.USER_TAGGED_SUCCESSFULLY)
    res.status(201).json(response);
    }  catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
});


