import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import User from '../models/user.model';
import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';
import { Op } from 'sequelize';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

export const updateNotification = asyncHandler(async(req:MyUserRequest,res: Response,next:NextFunction)=> {
    const user = req.user;
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }
    const {notificationsEnabled } = req.body;

    if(!user)
    {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }

    if(typeof notificationsEnabled === 'boolean')
    {
        return next(new ApiError(400,ERROR_MESSAGE.INVALID_NOTIFICATION_SETTING))
    }

    try {

        const [setting,created] = await db.Setting.findOrCreate({
            where: {userId: user.id},
            defaults: {
                userId: user.id,
                notificationsEnabled
            }
        });


        if(!created) {
            setting.notificationsEnabled = notificationsEnabled;
            await setting.save();
        }

        const response = new ApiResponse(200,setting,SUCCESS_MESSAGE.NOTIFICATION_SETTING_UPDATED);
        res.status(200).json(response);
    } catch(error) {
        console.error(error);
        return next(new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
})
