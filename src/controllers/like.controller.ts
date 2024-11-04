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


// liking post
export const likePost = asyncHandler(async(req:MyUserRequest,res: Response,next: NextFunction) => {
    const user = req.user;
    const {postId} = req.body;
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }
    if(!postId) {
        return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
    }
    try {
    const post = await db.Post.findByPk(postId);
      if(!post) {
        return next(new ApiError(400,ERROR_MESSAGE.POST_NOT_FOUND));
      }

    const like = await db.Like.create({
        userId: user.id,
        postId
    });

    if(post.userId !== user.id) {
        await db.Notification.create({
            message: `${user.userName} liked your post`,
            userId: post.userId,
            type: 'LIKE',
            isRead: false
        });
    }

    const response = new ApiResponse(201,like,SUCCESS_MESSAGE.POST_LIKED_SUCCESSFULLY);
    res.status(200).json(response);

    }catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }

    
})

//liking comment
export const likeComment = asyncHandler(async(req:MyUserRequest,res:Response,next: NextFunction) => {
    const user = req.user;
    const {commentId} = req.body;
    
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }

    if(!commentId) {
        return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
    }

    try {

        const comment = await db.Comment.findByPk(commentId);

        if(!comment) {
            return next(new ApiError(404,ERROR_MESSAGE.COMMENT_NOT_FOUND));
        }

        const likeComment = await db.Like.create({
            userId: user.id,
            commentId
        });

        if(comment.userId !== user.id) {

            await db.Notification.create({
                message: `${user.userName} liked your Comment`,
                userId: comment.userId,
                type: 'LIKE',
                isRead: false
            });
        }

        const response = new ApiResponse(201,likeComment,SUCCESS_MESSAGE.COMMENT_LIKED_SUCCESSFULLY);
        await res.status(201).json(response);
    }catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
})

