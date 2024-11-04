import { Router} from 'express';
import {BASE_API_ROUTES} from '../constants/routes.constants'

import userRoutes from './user.route';

import postRoutes from './posts.route';

import commentRoutes from './comment.route';

import friendshipRoutes from './friendship.route';

import tagRoutes from './tag.routes';

import likeRoutes from './like.routes';

import sharePostRoutes from './share-post.route';

import settingRoutes from './setting.route';


const router = Router();
router.use(BASE_API_ROUTES.USERS, userRoutes);
router.use(BASE_API_ROUTES.POSTS, postRoutes);
router.use(BASE_API_ROUTES.COMMENTS, commentRoutes);
router.use(BASE_API_ROUTES.FRIENDSHIPS, friendshipRoutes);
router.use(BASE_API_ROUTES.TAGS, tagRoutes);
router.use(BASE_API_ROUTES.LIKES, likeRoutes);
router.use(BASE_API_ROUTES.SHARE_POST, sharePostRoutes);
router.use(BASE_API_ROUTES.SETTING, settingRoutes);
export default router;