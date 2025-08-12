
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Measurement', {
    height_cm: { type: DataTypes.FLOAT, allowNull: false },
    weight_kg: { type: DataTypes.FLOAT, allowNull: false },
    age: { type: DataTypes.INTEGER },
    bmi: { type: DataTypes.FLOAT },
    category: { type: DataTypes.STRING },
  });
};
