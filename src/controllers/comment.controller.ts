import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import User from '../models/user.model';
import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';
import redisClient from '../utils/redis-client';


interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

 //create Comment
 export const createComment = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) =>  {

    const {content, postId} = req.body;
    const user = req.user;

    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }
    if(!content || !postId) {
        return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
    }

    try {
        await redisClient.del(`comment:post:${postId}`);
        const comment = await db.Comment.create({
            content,
            userId: user.id,
            postId
        });

        await redisClient.set(`comment:${comment.id}`,JSON.stringify(comment),'EX',3600);
        const response = new ApiResponse(201, {comment}, SUCCESS_MESSAGE.COMMENT_CREATED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
 });


 //get all comment
 export const getAllComment = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) =>  {
   const user = req.user;
   if(!user) {
    return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
   }

   try {

    const cachedComment= await redisClient.get('allComments')

    if(cachedComment!== null) {
        const response = new ApiResponse(200, JSON.parse(cachedComment), SUCCESS_MESSAGE.COMMENT_FETCHED_SUCCESSFULLY);
        res.status(200).json(response);
    }

    const comment = await db.Comment.findAll({});

    await redisClient.set('allComments',JSON.stringify(comment),'EX',3600);

    const response = new ApiResponse(200, {comment}, SUCCESS_MESSAGE.COMMENT_FETCHED_SUCCESSFULLY);
    res.status(200).json(response);
   } catch(error) {
    console.error(error);
    return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
   }

 });

 //update comment
 export const updateComment = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) =>  {
     const {commentId} = req.params;
     const {content} = req.body;
     const user = req.user;
     
     if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
     }

     try {
        const comment = await db.Comment.findOne({
            where: {id: commentId, userId: user.id}
        });
        if(!comment) {
             return next(new ApiError(404,ERROR_MESSAGE.COMMENT_NOT_FOUND));
        }
        comment.content = content;
        await comment.save();
        const response = new ApiResponse(200, {comment}, SUCCESS_MESSAGE.COMMENT_FETCHED_SUCCESSFULLY);
        res.status(201).json(response);
     } catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
     }


 });

//delete comment
export const deleteComment = asyncHandler(async(req: MyUserRequest,res: Response,next:NextFunction) => {
const  {commentId} = req.params;

const user = req.user;

if(!user) {
    return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));

}

const comment = await db.Comment.findOne({
   where: {id: commentId, userId: user.id}
})

if(!comment) {
    return next(new ApiError(404,ERROR_MESSAGE.COMMENT_NOT_FOUND));
}

await comment.destroy();
const response = new ApiResponse(200, {}, SUCCESS_MESSAGE.COMMENT_DELETED_SUCCESSFULLY);
res.status(201).json(response);
})


