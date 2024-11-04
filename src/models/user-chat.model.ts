import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
  } from 'sequelize';
      
  import db from '../sequelize-client';
      
  export interface UserChatModelCreationAttributes {
          userId:string;
          roomId:string;
      }    
  export interface UserChatModelAttributes extends UserChatModelCreationAttributes {
          id: string;
      }
  export default class UserChat extends Model<InferAttributes<UserChat>, InferCreationAttributes<UserChat>> {
    declare id: CreationOptional<string>;
    declare userId: string;
    declare roomId: string;
      
    static associate: (models: typeof db) => void;
  }
  export const userchat = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
    UserChat.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,

        },
        roomId: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'UserChat',
        tableName: 'userchats',
      },
    );
      
    UserChat.associate = models => {
      UserChat.belongsTo(models.ChatRoom,{foreignKey:'roomId',as:'chatRoom'});
      UserChat.belongsTo(models.User,{foreignKey:'userId',as:'user'});
    };
      
    return UserChat;
  };