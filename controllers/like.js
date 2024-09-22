const m = require('../models');

async function toggleLike(req, res) {
  const { postId } = req.params;
  const userId = req.user.id; // Assuming you have user authentication

  try {
    const existingLike = await m.Like.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingLike) {
      await existingLike.destroy();
      return res.json({ message: 'Unliked' });
    }

    const newLike = await m.Like.create({ post_id: postId, user_id: userId });
    res.status(201).json(newLike);
  } catch (error) {
    res.status(500).json({ error });
  }
}

module.exports = { toggleLike };
