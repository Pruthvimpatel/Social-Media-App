"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    static associate;
    static async hashPassword(user) {
        if (user.changed('password')) {
            const salt = await bcrypt_1.default.genSalt(10);
            user.password = await bcrypt_1.default.hash(user.password, salt);
        }
    }
}
exports.default = User;
const user = (sequelize, DataTypes) => {
    User.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profileImage: {
            type: DataTypes.STRING,
        },
        profileVisibility: {
            type: DataTypes.ENUM('PRIVATE', 'FRIENDS_ONLY', 'PUBLIC'),
            defaultValue: 'PUBLIC',
        },
    }, {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'User',
        tableName: 'users',
        hooks: {
            beforeCreate: User.hashPassword,
            beforeUpdate: User.hashPassword,
        },
    });
    User.associate = models => {
    };
    return User;
};
exports.user = user;
