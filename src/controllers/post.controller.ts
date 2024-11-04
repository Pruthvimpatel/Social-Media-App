import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import User from '../models/user.model';
import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';
import redis from '../utils/redis-client';
import redisClient from '../utils/redis-client';
import uploadOnCloudinary from '../utils/cloudinary';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

//create Post
export const createPost = asyncHandler(async(req: MyUserRequest, res: Response, next: NextFunction) => {
    const {content , captions} = req.body;
    const user = req.user;
  if(!user) {
    return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
  }
   if(!content || !captions) {
    return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
   }
   try {
    await redisClient.del('allPosts');
    const post = await db.Post.create({
        content,
        captions,
        userId: user.id
    });

    await redisClient.set(`post:${post.id}`,JSON.stringify(post), 'EX', 3600);

    const response = new ApiResponse(201, {post}, SUCCESS_MESSAGE.POST_CREATED_SUCCESSFULLY);
    res.status(201).json(response);
   } catch(error) {
    console.error(error);
    return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
   }
});


//get All post 
export const getAllPost = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) =>  {
    const user = req.user;
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }
    try {
        const cachedPosts = await redisClient.get('allPosts');
    
        if (cachedPosts !== null) { 
            const response = new ApiResponse(200, JSON.parse(cachedPosts), SUCCESS_MESSAGE.POST_FETCHED_SUCCESSFULLY);
             res.status(200).json(response);
        }
        const getPost = await db.Post.findAll();
        const response = new ApiResponse(200, {getPost}, SUCCESS_MESSAGE.POST_FETCHED_SUCCESSFULLY);
       res.status(201).json(response);
    } catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
});


//update post
export const updatePost = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) =>  {
    const {postId} = req.params;
    const {content , captions} = req.body;
    const user = req.user;

    if(!user) {
        throw new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND);
    }

    if(!content || !captions) {
        throw new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED);
    }
    
    try {
        const post = await db.Post.findOne({where: {id: postId,userId:user.id}});

        if(!post) {
            throw new ApiError(400,ERROR_MESSAGE.POST_NOT_FOUND);
        }
        post.content = content;
        post.captions = captions;
        await post.save();

        await redisClient.set(`post:${postId}`,JSON.stringify(post), 'EX', 3600);

        const response = new ApiResponse(200, {post}, SUCCESS_MESSAGE.POST_FETCHED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
});


//delete post
export const deletePost = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) =>  {
    const {postId} = req.params;
    const user = req.user;

    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }

    try {
        const post = await db.Post.findOne({
            where: {id: postId,userId:user.id}
        });

        if(!post) {
            return next(new ApiError(404,ERROR_MESSAGE.POST_NOT_FOUND));
        }
        await post.destroy();

        await redisClient.del(`post:${postId}`);
        await redisClient.del('allPosts');
        const response = new ApiResponse(200, {}, SUCCESS_MESSAGE.POST_DELETED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
});



