import {Router} from 'express';
import {SHARE_POST_ROUTES} from '../constants/routes.constants';
import {sharePost} from '../controllers/share-post.controller';
import {verifyToken} from '../middleware/auth.middleware';
const router = Router();

router.post(SHARE_POST_ROUTES.SHARE_POST,verifyToken,sharePost);

export default router;