const m = require('../models');

async function index(req, res) {
  const { postId } = req.params;
  try {
    const comments = await m.Comment.findAll({
      where: { post_id: postId },
      include: [
        { model: m.Post, as: 'post', attributes: ['id', 'content'] },
        { model: m.User, as: 'user', attributes: ['id', 'name'] },
      ],
    });

    // const comments = await m.Comment.findAll({
    //   include: [
    //     { model: m.User, as: 'user', attributes: ['id', 'name'] },
    //   ],
    // });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);  // Log the error details
    res.status(500).json({ error: error.message }); // Return the error message
    // res.status(500).json({ error });
  }
}

async function create(req, res) {
  console.log('Creating comment: ', req);
  
  const { postId } = req.params;
  const { comment } = req.body;

  console.log('Creating comment for post_id:', postId);
console.log('User ID:', req.user.id);

  try {
    const newComment = await m.Comment.create({
      post_id: postId,
      user_id: req.user.id, // Assuming you have user authentication
      comment,
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error });
  }
}

module.exports = { index, create };
