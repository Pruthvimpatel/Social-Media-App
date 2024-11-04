import { Request, Response, NextFunction} from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import User from '../models/user.model';
import {ERROR_MESSAGE,SUCCESS_MESSAGE} from  '../constants/message';
import { v4 as UUIDV4 } from 'uuid';


interface MyUserRequest extends Request {
  token?: string;
  user?: User;
}

/**
 * Creates a new chat room.
 * @param {MyUserRequest} req - The request object containing user and chat room data.
 * @param {Response} res - The response object used to send the response.
 * @param {NextFunction} next - The middleware function to pass control to the next handler.
 * @throws {ApiError} Throws an error if user is not found or required fields are missing.
 * @returns {Promise<void>} Sends a response with the created chat room data.
 */


//creating chat-room 
export const createChatRoom = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userIds, isGroup, name } = req.body;

    if (!user) {
      return next(new ApiError(401, 'User not found.'));
    }

    if (!userIds || !isGroup || !name) {
      return next(new ApiError(400, ERROR_MESSAGE.ALL_FIELDS_REQUIRED)); 
    }

    try {
      const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];
      const roomId = UUIDV4();

      const chatRoom = await db.ChatRoom.create({
        id: roomId,
        isGroup,
        name: isGroup ? name : null,
      });
      await db.UserChat.bulkCreate(
        userIdsArray .map((userId: string) => ({
          userId,
          roomId,
        })),
      );

      const response = new ApiResponse(201, {chatRoom},SUCCESS_MESSAGE.CHAT_ROOM_CREATED_SUCCESSFULLY);
      console.log("response", response);
      res.status(201).json(response);

    } catch (error) {
      console.error(error);
      return next(new ApiError(500, ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
    }
  }
);

//get chat room messages
export const getChatRoomMessage = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
  const user = req.user;
  const {roomId} = req.params;
  if(!user) {
    return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
  }
  if(!roomId) {
    return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
  }
  try {

    const message = await db.Chat.findAll({
      where: {
        roomId,
      },
      order: [['createdAt', 'ASC']],

    });
    const response = new ApiResponse(200, {messages: message}, SUCCESS_MESSAGE.CHAT_ROOM_MESSAGE_RETRIEVED_SUCCESSFULLY);
    res.status(200).json(response);
  } catch(error) {
    console.error(error);
    return next(new ApiError(500, ERROR_MESSAGE.INTERNAL_SERVER_ERROR));
  }
})

//send chat message
export const sendMessage = asyncHandler(async(req:MyUserRequest,res:Response,next: NextFunction) => {
  const user = req.user;
  const {roomId,message,receiverId} = req.body;
  if(!user ) {
    return next(new ApiError(400,ERROR_MESSAGE.USER_NOT_FOUND));
  }

  if(!roomId ||!message ||!receiverId) {
    return next(new ApiError(400,ERROR_MESSAGE.ALL_FIELDS_REQUIRED));
  }

  try {
    const newMessage = await db.Chat.create({
      senderId: user.id,
      receiverId,
      roomId,
      message,
      sendTime: new Date(),
      isSeen: false,
    });
    const response = new ApiResponse(201,{newMessage},SUCCESS_MESSAGE.MESSAGE_SENT_SUCCESSFULLY);
    res.status(200).json(response);
  } catch(error) {
    console.error(error);
    return next(new ApiError(500, ERROR_MESSAGE.INTERNAL_SERVER_ERROR));}
})

