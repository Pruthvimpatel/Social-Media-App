import { Router } from "express";
import { POSTS_ROUTES } from "../constants/routes.constants";
import {createPost,getAllPost,updatePost,deletePost} from '../controllers/post.controller';

import {verifyToken} from '../middleware/auth.middleware';


const router = Router();

router.post(POSTS_ROUTES.CREATE,verifyToken,createPost);
router.get(POSTS_ROUTES.GET,verifyToken,getAllPost);
router.put(POSTS_ROUTES.UPDATE,verifyToken,updatePost);
router.delete(POSTS_ROUTES.DELETE,verifyToken,deletePost);
export default router;