import { Router } from "express";
import { COMMENT_ROUTES } from "../constants/routes.constants";
import {createComment, getAllComment,updateComment,deleteComment} from '../controllers/comment.controller';
import {verifyToken} from '../middleware/auth.middleware';

const router = Router();

router.post(COMMENT_ROUTES.CREATE,verifyToken,createComment);
router.get(COMMENT_ROUTES.GET,verifyToken,getAllComment);
router.put(COMMENT_ROUTES.UPDATE,verifyToken,updateComment);
router.delete(COMMENT_ROUTES.DELETE,verifyToken,deleteComment);
export default router;

