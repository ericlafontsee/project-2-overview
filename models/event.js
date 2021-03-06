const uuid = require("uuid");

module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define("Event", {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    eventDate: DataTypes.DATE,
  });

  Event.associate = (models) => {
    // Associating individuals (User) with Events
    Event.belongsToMany(models.User, {
      through: models.UserEvent,
    });
    //Associating the Organization that created the Event
    Event.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: true,
        defaultValue: 1,
      },
      // When an Organization is deleted, also delete any associated Events
      onDelete: "cascade",
    });
  };

  return Event;
};
