'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // A message belongs to the user who sent it
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender',
      });
      // A message belongs to the user who receives it
      Message.belongsTo(models.User, {
        foreignKey: 'receiverId',
        as: 'receiver',
      });
    }
  }

  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,   // uses Sequelize’s helper
        primaryKey: true,
        allowNull: false
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'Messages',
    }
  );

  return Message;
};
