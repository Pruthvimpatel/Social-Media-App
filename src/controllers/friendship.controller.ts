import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import User from '../models/user.model';
import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';
import { Op } from 'sequelize';
import redisClient from '../utils/redis-client';

interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };


 //sending a friend request
 export const sendFriendRequest = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const {receiverId} = req.body;
  if(!user) {
   return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND)); 
  }

if(!receiverId) {
    throw new ApiError(400,ERROR_MESSAGE.RECEIVER_ID_REQUIRED);
}
try {
    const newFriendRequest = await db.Friendship.create({
        requesterId: user.id,
        receiverId: receiverId,
        status: 'PENDING'
    });

    if(receiverId !== user.id) {
     await db.Notification.create({
         message: `${user.userName} sent you a friend request`,
         userId: receiverId,
         type: 'FRIEND_REQUEST',
         isRead: false
     }); 
    }

    await redisClient.del(`friends:${user.id}`);

    const response = new ApiResponse(200, {newFriendRequest}, SUCCESS_MESSAGE.FRIEND_REQUEST_SENT_SUCCESSFULLY);
    res.status(201).json(response);
} catch(error) {
    console.error(error);
    throw new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
}
 });

 //accepting a friend request
 export const acceptFriendRequest = asyncHandler(async(req: MyUserRequest, res: Response, next: NextFunction) => {
    
    const user = req.user;
    const {requesterId} = req.body;
    if(!user) {
        return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
    }
    if(!requesterId) {
        return next(new ApiError(400,ERROR_MESSAGE.REQUESTER_ID_REQUIRED));
    }
    try {
  
        if(requesterId !== user.id) {
            const notification = await db.Notification.create({
                message:`${user.userName} accepted your friend request.`,
                userId: requesterId,
                type: 'FRIEND_REQUEST',
                isRead: false
            });
            await notification.update({isRead: true});
        }


        await redisClient.del(`friends:${user.id}`);
        await redisClient.del(`friends:${requesterId}`);
        
        const response = new ApiResponse(200, SUCCESS_MESSAGE.FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY);
        res.status(201).json(response);

    } catch(error) {
       console.error(error);
       throw new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
    
 });

 //rejecting a friend request
 export const rejectFriendRequest = asyncHandler(async(req: MyUserRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const {requesterId} = req.body;

   if(!user) {
    return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
   }
   if(!requesterId) {
    return next(new ApiError(400,ERROR_MESSAGE.REQUESTER_ID_REQUIRED));
   }
   try {
// const friendRequest = await db.Friendship.findOne({
//     where: {
//         requesterId,
//         receiverId: user.id
//     }
// });

// if(!friendRequest) {
//     return next(new ApiError(404,ERROR_MESSAGE.FRIEND_REQUEST_NOT_FOUND));
// }
    await db.Notification.create({
        message:`${user.userName} rejected your friend request.`,
        userId: requesterId,
        type: 'FRIEND_REQUEST',
        isRead: false
    })
    const response = new ApiResponse(200, SUCCESS_MESSAGE.FRIEND_REQUEST_REJECTED)
    res.status(201).json(response);
   }catch(error) {
    console.error(error);
    throw new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
   }
 });

//get all friends
export const getFriends = asyncHandler(async(req:MyUserRequest,res: Response,next: NextFunction) => {
 const user = req.user;
if(!user) {
    return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
}
try {
    const cachedFriend = await redisClient.get(`friends:${user.id}`);

    if(cachedFriend  !== null) {
        const response = new ApiResponse(200,JSON.parse(cachedFriend),SUCCESS_MESSAGE.FRIENDS_FETCHED_SUCCESSFULLY);
        res.status(200).json(response);
    }
    const friendship = await db.Friendship.findAll({
        where: {
            [Op.or]: [
                {requesterId: user.id,status: 'ACCEPTED'},
                {receiverId: user.id,status: 'ACCEPTED'}
            ]
        },

        include: [
            {
                model: db.User,
                as: 'requester',
                attributes:['email','userName','profileImage']
            },
            {
                model: db.User,
                as: 'receiver',
                attributes: ['email','userName','profileImage']
            }
        ]
    });

    const formattedFriends = friendship.map(friendship => {
        const requester = friendship.requester;
        const receiver = friendship.receiver;

        return requester && receiver
         ? friendship.requesterId === user.id
         ? { email: receiver.email,userName: receiver.userName, profileImage: receiver.profileImage }
         : {email: requester.email, userName: requester.userName, profileImage: requester.profileImage}
         : null;
    }).filter(friend => friend !== null);

      await redisClient.set(`friends:${user.id}`,JSON.stringify(formattedFriends), 'EX',3600);

    const response = new ApiResponse(200,{formattedFriends},SUCCESS_MESSAGE.FRIENDS_FETCHED_SUCCESSFULLY)
    res.status(200).json(response);
} catch(error) {
    console.error(error);
    throw new ApiError(500,ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
}
});

