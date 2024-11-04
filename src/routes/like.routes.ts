import { Router } from "express";
import { LIKE_ROUTES } from "../constants/routes.constants";
import {likePost,likeComment} from '../controllers/like.controller';
import {verifyToken} from '../middleware/auth.middleware';

const router = Router();
router.post(LIKE_ROUTES.LIKE_POST,verifyToken,likePost);
router.post(LIKE_ROUTES.LIKE_COMMENT,verifyToken,likeComment);
export default router;