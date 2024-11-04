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
 };


 //sharing post to multiple recipients
 export const sharePost = asyncHandler(
    async (req: MyUserRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        const { postId, recipientUserIds } = req.body;
        if (!user) {
            return next(new ApiError(400, ERROR_MESSAGE.USER_NOT_FOUND));
        }
        if (!postId || !recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
            return next(new ApiError(400, ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
        }
        try {
            const post = await db.Post.findByPk(postId);
            if (!post) {
                return next(new ApiError(400, ERROR_MESSAGE.POST_NOT_FOUND));
            }
            const results = [];
            for (const recipientUserId of recipientUserIds) {
                const recipientUser = await db.User.findByPk(recipientUserId);
                
                if (!recipientUser) {
                    results.push({ recipientUserId, status: 'error', message: ERROR_MESSAGE.RECIPIENT_USER_NOT_FOUND });
                    continue;
                }

                if (recipientUser.profileVisibility === 'PRIVATE') {
                    results.push({ recipientUserId, status: 'error', message: ERROR_MESSAGE.PRIVATE_PROFILE });
                    continue;
                }
                if (recipientUser.profileVisibility === 'FRIENDS_ONLY') {
                    const isFriend = await db.Friendship.findOne({
                        where: {
                            requesterId: user.id,
                            receiverId: recipientUserId
                        }
                    });

                    if (!isFriend) {
                        results.push({ recipientUserId, status: 'error', message: ERROR_MESSAGE.USER_NOT_FRIENDS });
                        continue;
                    }
                }
                const sharePost = await db.SharePost.create({
                    userId: user.id,
                    postId,
                    recipientUserId
                });
                results.push({ recipientUserId, status: 'success', data: sharePost });
            }
            const response = new ApiResponse(201, results, SUCCESS_MESSAGE.POST_SHARED_SUCCESSFULLY);
            res.status(201).json(response);
        } catch (error) {
            console.error(error);
            return next(new ApiError(500, ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
        }
    }
);
