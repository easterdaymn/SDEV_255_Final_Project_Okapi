const User = require('../models/User');
const Course = require('../models/courses');

const renderStudentsPage = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch the user's schedule
    const user = await User.findById(userId);

    // Fetch all available courses
    const allCourses = await Course.find();

    // Render the page with the user and course information
    res.render('students', { title: 'Students', user, courses: allCourses });
  } catch (err) {
    console.error('Error rendering /students page:', err);
    res.status(500).send('Internal Server Error');
  }
};

const addToSchedule = async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    // Add the course to the user's schedule
    await User.findByIdAndUpdate(userId, { $addToSet: { schedule: courseId } });
  
    // Fetch the updated user information and courses
    const user = await User.findById(userId);
    const courses = await Course.find();
  
    // Redirect back to the /students page with the updated schedule
    res.render('students', { title: 'Students', user, courses });
  } catch (err) {
    console.error('Error in addToSchedule:', err);
    res.status(500).send('Internal Server Error: Unable to update schedule.');
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
  renderStudentsPage,
  addToSchedule,
  removeFromSchedule,
};
