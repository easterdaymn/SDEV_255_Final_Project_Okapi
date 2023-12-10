const User = require('../models/User');

const addToSchedule = async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    // Add the course to the user's schedule
    await User.findByIdAndUpdate(userId, { $addToSet: { schedule: courseId } });

    // Redirect back to the /students page with the updated schedule
    res.redirect('/students');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

const removeFromSchedule = async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    // Remove the course from the user's schedule
    await User.findByIdAndUpdate(userId, { $pull: { schedule: courseId } });

    // Fetch the updated user information and courses
    const user = await User.findById(userId);
    const courses = await Course.find();

    res.render('students', { title: 'Students', user, courses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  addToSchedule,
  removeFromSchedule,
};
