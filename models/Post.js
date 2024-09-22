const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      this.hasMany(models.Comment, { foreignKey: 'post_id', as: 'comments' });
      this.hasMany(models.Like, { foreignKey: 'post_id', as: 'likes' });
    }
  }
  Post.init({
    user_id: DataTypes.STRING,
    content: DataTypes.TEXT,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};
