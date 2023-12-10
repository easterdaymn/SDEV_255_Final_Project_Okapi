const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const Course = require('./models/courses');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const cookieParser = require('cookie-parser'); 
const authMiddleware = require('./middleware/authMiddleware');


// express app
const app = express();
const port = 8000;

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// connect to mongodb & listen for requests
const dbURI = "mongodb+srv://new-user:test1234@cluster0.lfyqo0j.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(8000))
  .catch(err => console.log(err));

// set the view engine to EJS
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(authRoutes);
app.use(scheduleRoutes);

// Route to render the index page
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Render courses for non-staff view
app.get('/courses', (req, res) => {
  Course.find()
    .then(courses => {
      res.render('courses', { title: 'Courses', courses });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Render courses for staff view
app.get('/staff/courses', authMiddleware.requireAuth, (req, res) => {
  // The requireAuth middleware has already checked the user's role
  if (req.user.role === 'teacher' || req.user.role === 'other_staff_role') {
    Course.find()
      .then(courses => {
        res.render('courses', { title: 'Courses', courses });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
      });
  } else {
    res.status(403).send('Forbidden: Only staff members can access the courses page.');
  }
});


// Route to render the students page
app.get('/students', authMiddleware.requireAuth, async (req, res) => {
  if (req.user.role === 'student') {
    try {
      const user = req.user;
      console.log('User Data:', user);

      const courses = await Course.find();
      console.log('Courses:', courses);

      res.render('students', { title: 'Students', user, courses });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(403).send('Forbidden: Teachers cannot access the students page.');
  }
});

// Route to handle adding a course to the schedule
app.post('/students', authMiddleware.requireAuth, async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  try {
    // Add the course to the user's schedule
    await User.findByIdAndUpdate(userId, { $addToSet: { schedule: courseId } });
    
    // Fetch the updated user information and courses
    const user = await User.findById(userId);
    const courses = await Course.find();

    res.render('students', { title: 'Students', user, courses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle dropping a course from the schedule
app.post('/students/drop', authMiddleware.requireAuth, async (req, res) => {
  const { courseId } = req.body;
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
});


// Route to render the staff dashboard
app.get('/staff', authMiddleware.requireAuth, (req, res) => {
  if (req.user.role === 'teacher') {
    Course.find()
      .then(courses => {
        res.render('staff', { title: 'Staff', courses });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
      });
  } else {
    res.status(403).send('Forbidden: Students cannot access the staff dashboard.');
  }
});


// Route to render the form for creating a new course
app.get('/staff/courses/create', authMiddleware.requireAuth, (req, res) => {
  if (req.user.role === 'teacher') {
    res.render('create', { title: 'Create New Course' });
  } else {
    res.status(403).send('Forbidden: Students cannot create new courses.');
  }
});

// Route to handle the submission of the new course form
app.post('/staff/courses/create', authMiddleware.requireAuth, (req, res) => {
  console.log('User Role (POST):', req.user.role);
  if (req.user.role === 'teacher') {
    const { courseName, description, subjectArea, credits } = req.body;
    const newCourse = new Course({ courseName, description, subjectArea, credits });

    newCourse.save()
      .then(result => {
        res.redirect('/staff/courses');
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
      });
  } else {
    res.status(403).send('Forbidden: Students cannot create new courses.');
  }
});

// Route to handle the deletion of a course
app.post('/staff/courses/delete/:id', authMiddleware.requireAuth, (req, res) => {
  if (req.user.role === 'teacher') {
    const id = req.params.id;

    Course.findByIdAndDelete(id)
      .then(result => {
        res.json({ redirect: '/staff', message: 'Course successfully deleted.' });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
      });
  } else {
    res.status(403).send('Forbidden: Students cannot delete courses.');
  }
});

// Route to show the form for editing a course
app.get('/staff/courses/edit/:id', authMiddleware.requireAuth, (req, res) => {
  if (req.user.role === 'teacher') {
    const id = req.params.id;
    Course.findById(id)
      .then(course => {
        res.render('edit', { course, title: 'Edit Course' });
      })
      .catch(err => {
        console.log(err);
        res.status(404).render('404', { title: '404 Page Not Found' });
      });
  } else {
    res.status(403).send('Forbidden: Students cannot edit courses.');
  }
});

// Route to handle the editing form submission
app.post('/staff/courses/edit/:id', authMiddleware.requireAuth, (req, res) => {
  if (req.user.role === 'teacher') {
    const id = req.params.id;
    const { courseName, description, subjectArea, credits } = req.body;

    Course.findByIdAndUpdate(id, { courseName, description, subjectArea, credits })
      .then(result => {
        res.json({ redirect: '/staff/courses' });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
      });
  } else {
    res.status(403).send('Forbidden: Students cannot edit courses.');
  }
});


// Route to render the individual course page
app.get('/course/:id', (req, res) => {
  const id = req.params.id;
  console.log(`Fetching course details for ID ${id}`);
  Course.findById(id)
    .then(course => {
      console.log('Course details:', course);
      res.render('course', { course, title: `Course: ${course.courseName}` });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});


// handle 404 errors
app.use((req, res) => {
  res.status(404).render('404', { title: '404 Page Not Found' });

});

