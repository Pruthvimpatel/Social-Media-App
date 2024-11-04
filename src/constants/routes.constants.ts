export const USER_ROUTES = {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    UPLOAD_PROFILE:'/upload-profile',
};

export const POSTS_ROUTES = {
    CREATE: '/create-post',
    GET: '/get-all-post',
    UPDATE: '/update-post/:postId',
    DELETE: '/delete-post/:postId'
};

export const COMMENT_ROUTES = {
    CREATE: '/create-comment',
    GET: '/get-all-comment',
    UPDATE: '/update-comment/:commentId',
    DELETE: '/delete-comment/:commentId'
};

export const FRIENDSHIP_ROUTES = {
    SENT_FRIEND_REQUEST: '/sent_friend_request',
    ACCEPT_FRIEND_REQUEST: '/accept_friend_request',
    REJECT_FRIEND_REQUEST: '/reject_friend_request',
    GET_FRIENDS: '/get_friends'
};

export const TAG_ROUTES = {
    TAG_USER: '/tag-user'
};


export const SHARE_POST_ROUTES = {
   SHARE_POST: '/share-post'
};

export const LIKE_ROUTES = {
    LIKE_POST: '/like-post',
    LIKE_COMMENT: '/like-comment',
};


export const SETTING_ROUTES = {
    UPDATE_SETTING: '/notifications',
};

export const CHAT_ROUTES = {
CREATE_CHAT_ROOM: '/create-chat-room',
GET_CHAT_ROOM_MESSAGE: '/get-chat-room-message/:roomId',
SEND_MESSAGE: '/send-message',
};

export const BASE_API_ROUTES = {
    USERS: '/users',
    POSTS: '/posts',
    COMMENTS: '/comments',
    FRIENDSHIPS: '/friendships',
    TAGS: '/tags',
    LIKES: '/likes',
    SHARE_POST: '/share-posts',
    CHAT: '/chats',
    SETTING:'/settings',
};

export const REST_API_PREFIX = {
    API_V1: '/api/v1'
};