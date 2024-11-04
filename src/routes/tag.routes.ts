import {Router} from 'express';

import {tagUser} from '../controllers/tag.controller';

import {TAG_ROUTES} from '../constants/routes.constants'

import {verifyToken} from '../middleware/auth.middleware';

const router = Router();

router.post(TAG_ROUTES.TAG_USER,verifyToken,tagUser);

export default router;