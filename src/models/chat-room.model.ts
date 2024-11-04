/* eslint-disable max-len */
import Sequelize, {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
    DataTypes,
  } from 'sequelize';
    
  import db from '../sequelize-client';
    
  export interface ChatRoomModelCreationAttributes {
        name:string;
        isGroup:boolean;
    }
    
  export interface ChatRoomModelAttributes extends ChatRoomModelCreationAttributes {
        id: CreationOptional<string>;
    }
    
  export default class ChatRoom extends Model<InferAttributes<ChatRoom>, InferCreationAttributes<ChatRoom>> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare isGroup: boolean;
    
    static associate: (models: typeof db) => void;
  }
    
  export const chatroom = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
    ChatRoom.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false, 
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        isGroup: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        underscored: true,
        timestamps: true,
        paranoid: true,
        modelName: 'ChatRoom',
        tableName: 'chatrooms',
      },
    );
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ChatRoom.associate = models => {
      ChatRoom.hasMany(models.UserChat,{foreignKey:'roomId',as:'userchat'});
      ChatRoom.hasMany(models.Chat,{foreignKey:'roomId',as:'chat'});
    };
    
    return ChatRoom;
  };
    