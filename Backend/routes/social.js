// Follow user directly (no request/approval)
router.post('/follow/:targetId', auth, async (req, res) => {
  try {
    const followerId = req.user._id;
    const targetId = req.params.targetId;

    if (followerId.toString() === targetId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const [follower, targetUser] = await Promise.all([
      User.findById(followerId),
      User.findById(targetId),
    ]);

    if (!follower || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add to following list if not already following
    if (!follower.following.includes(targetId)) {
      follower.following.push(targetId);
    }

    // Add to followers list if not already added
    if (!targetUser.followers.includes(followerId)) {
      targetUser.followers.push(followerId);
    }

    await Promise.all([follower.save(), targetUser.save()]);
    res.status(200).json({ message: "Successfully followed user" });
  } catch (err) {
    console.error("Error in follow route:", err);
    res.status(500).json({ message: "Failed to follow user" });
  }
});
