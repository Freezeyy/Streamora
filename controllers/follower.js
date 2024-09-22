const m = require('../models');

async function follow(req, res) {
  const { followingId } = req.body;
  const followerId = req.user.id; // Assuming you have user authentication

  try {
    const newFollower = await m.Follower.create({
      follower_id: followerId,
      following_id: followingId,
    });
    res.status(201).json(newFollower);
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function unfollow(req, res) {
  const { followingId } = req.body;
  const followerId = req.user.id; // Assuming you have user authentication

  try {
    await m.Follower.destroy({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
    res.json({ message: 'Unfollowed' });
  } catch (error) {
    res.status(500).json({ error });
  }
}

module.exports = { follow, unfollow };
