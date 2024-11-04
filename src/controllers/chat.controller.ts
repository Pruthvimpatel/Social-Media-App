// import { Request, Response, NextFunction} from 'express';
// import ApiError from '../utils/api-error';
// import ApiResponse from '../utils/api-response';
// import asyncHandler from '../utils/async-handler';
// import db  from '../sequelize-client';
// import User from '../models/user.model';
// import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';
// import { UUIDV4 } from 'sequelize';

// interface MyUserRequest extends Request {
//     token?: string;
//     user?: User;
// }


// export const createChatRoom = asyncHandler(async(req:MyUserRequest,res: Response,next: NextFunction) => {
// const user = req.user;
// const {userIds,isGroup,name}= req.body;
//    if(!user) {
//     return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
//    }

//    if(!userIds || !isGroup  || !name) {
//     return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
//    }
//    try {
//   const roomId = UUIDV4();
//   const chatRoom = await db.ChatRoom.create({
//     isGroup,
//     name:isGroup ? name : null,
//   });

//   await db.UserChat.bulkCreate(
//     userIds.map((userId: string))
//   )


//    }catch(error) {
//     console.error(error);

//    }
// })