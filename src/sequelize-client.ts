import * as dotenv from 'dotenv'
dotenv.config();
import { DataTypes,Sequelize } from 'sequelize';

import config from './models/config';
import { user } from './models/user.model';
import {accessToken} from './models/access-token.model';
import {post} from './models/posts.model';
import {comment} from './models/comments.model';
import {friendship} from './models/friendship.model';
import {notification} from './models/notification.model';
import {setting} from './models/setting.model';
import {usertag} from './models/user-tag.model';
import {like} from './models/like.model'
import {sharepost} from './models/share-post.model';
import {chatroom} from './models/chat-room.model';
import {chat} from './models/chat.model';
import {userchat} from './models/user-chat.model';

const env = process.env.NODE_ENV || 'development';

type Model = (typeof db)[keyof typeof db]

type ModelWithAssociate = Model & { associate:(model: typeof db) => void }

const checkAssociation = (model: Model): model is ModelWithAssociate => {
    return 'associate' in model;
};

const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database,dbConfig.username, dbConfig.password,dbConfig);

const db = {
    sequelize: sequelize,
    User: user(sequelize,DataTypes),
    AccessToken: accessToken(sequelize,DataTypes),
    Post: post(sequelize,DataTypes),
    Comment: comment(sequelize,DataTypes),
    Friendship: friendship(sequelize,DataTypes),
    Notification: notification(sequelize,DataTypes),
    Setting: setting(sequelize,DataTypes),
    UserTag: usertag(sequelize,DataTypes),
    Like: like(sequelize,DataTypes),
    SharePost: sharepost(sequelize,DataTypes),
    ChatRoom: chatroom(sequelize,DataTypes),
    Chat: chat(sequelize,DataTypes),
    UserChat: userchat(sequelize,DataTypes),
     models: sequelize.models
};

Object.entries(db).forEach(([, model]: [string,Model]) => {
   if(checkAssociation(model)) {
    model.associate(db);
   } 
});

export default db;