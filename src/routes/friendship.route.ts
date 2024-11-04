import {Router} from 'express';
import {FRIENDSHIP_ROUTES} from '../constants/routes.constants';
import {sendFriendRequest,acceptFriendRequest,rejectFriendRequest,getFriends} from '../controllers/friendship.controller';
import {verifyToken} from '../middleware/auth.middleware';

const router = Router();
router.post(FRIENDSHIP_ROUTES.SENT_FRIEND_REQUEST,verifyToken,sendFriendRequest);
router.post(FRIENDSHIP_ROUTES.ACCEPT_FRIEND_REQUEST,verifyToken,acceptFriendRequest);
router.post(FRIENDSHIP_ROUTES.REJECT_FRIEND_REQUEST,verifyToken,rejectFriendRequest);
router.get(FRIENDSHIP_ROUTES.GET_FRIENDS,verifyToken,getFriends);

export default router;