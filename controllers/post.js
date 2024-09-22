const m = require('../models');

async function index(req, res) {
  const includes = [
    { model: m.User, attributes: ['id', 'name', 'image'], as: 'user' }
  ];

  // Check if 'with' query parameter exists and includes 'comments'
  if (req.query.with && req.query.with.includes('comments')) {
    includes.push({
      model: m.Comment,
      as: 'comments', // Match the alias defined in your Post model
      include: [
        {
          model: m.User,
          as: 'user', // Match the alias defined in your Comment model
          attributes: ['id', 'name'], // Specify attributes to include
        },
      ],
    });
  }

  // Check if 'with' query parameter exists and includes 'likes'
  if (req.query.with && req.query.with.includes('likes')) {
    includes.push({
      model: m.Like,
      as: 'likes', // Match the alias defined in your Post model for Likes
      attributes: ['user_id'], // Only return the user_id of the users who liked the post
    });
  }

  try {
    const posts = await m.Post.findAll({
      include: includes,
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error });
  }
}


async function create(req, res) {
  const { content, image } = req.body;
  try {
    const post = await m.Post.create({
      user_id: req.user.id, // Assuming you have user authentication
      content,
      image,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function getDetails(req, res) {
  const { id } = req.params;
  try {
    const post = await m.Post.findByPk(id, {
      include: [{ model: m.User, attributes: ['id', 'name', 'image'] }],
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error });
  }
}

module.exports = { index, create, getDetails };
