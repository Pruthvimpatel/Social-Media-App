import {Router} from 'express';
import {SETTING_ROUTES} from '../constants/routes.constants'
import {updateNotification} from '../controllers/setting.controller';
import  {verifyToken} from '../middleware/auth.middleware';
const router = Router();

router.post(SETTING_ROUTES.UPDATE_SETTING,verifyToken,updateNotification);

export default router;