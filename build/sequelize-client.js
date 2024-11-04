"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("./models/config"));
const user_model_1 = require("./models/user.model");
// import {accessToken} from './models/access-token.model';
// import {task} from './models/task.model';
// import {status} from './models/status.model';
// import {subtask} from './models/subtask.model';
// import {taskShare} from './models/share-task.model';
// import {reminder} from './models/reminder.model'
const env = process.env.NODE_ENV || 'development';
const checkAssociation = (model) => {
    return 'associate' in model;
};
const dbConfig = config_1.default[env];
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
const db = {
    sequelize: sequelize,
    User: (0, user_model_1.user)(sequelize, sequelize_1.DataTypes),
    //  AccessToken: accessToken(sequelize,DataTypes),
    //  Task: task(sequelize,DataTypes),
    //  Status: status(sequelize,DataTypes),
    //  SubTask: subtask(sequelize,DataTypes),
    //  TaskShare: taskShare(sequelize,DataTypes),
    //  Reminder: reminder(sequelize,DataTypes),
    models: sequelize.models
};
Object.entries(db).forEach(([, model]) => {
    if (checkAssociation(model)) {
        model.associate(db);
    }
});
exports.default = db;
