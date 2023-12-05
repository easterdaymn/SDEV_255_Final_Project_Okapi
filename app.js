const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const Course = require('./models/courses');

// express app
const app = express();
const port = 3001;

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// connect to mongodb & listen for requests
const dbURI = "mongodb+srv://new-user:test1234@cluster0.lfyqo0j.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3001))
  .catch(err => console.log(err));

// set the view engine to EJS
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));


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
app.get('/staff/courses', (req, res) => {
  Course.find()
    .then(courses => {
      res.render('courses', { title: 'Courses', courses });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Route to render the students page
app.get('/students', (req, res) => {
  res.render('students', { title: 'Students' });
});

// Route to render the staff dashboard
app.get('/staff', (req, res) => {
  // Retrieve and render all courses for staff view
  Course.find()
    .then(courses => {
      res.render('staff', { title: 'Staff', courses });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Route to render the form for creating a new course
app.get('/staff/courses/create', (req, res) => {
  res.render('create', { title: 'Create New Course' });
});

// Route to handle the submission of the new course form
app.post('/staff/courses/create', (req, res) => {
  const { courseName, description, subjectArea, credits } = req.body;
  const newCourse = new Course({ courseName, description, subjectArea, credits });

  newCourse.save()
    .then(result => {
      res.redirect('/staff/courses'); // Corrected redirect URL
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Route to handle the deletion of a course
app.post('/staff/courses/delete/:id', (req, res) => {
  const id = req.params.id;

  Course.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/staff/courses' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Route to show the form for editing a course
app.get('/staff/courses/edit/:id', (req, res) => {
  const id = req.params.id;
  Course.findById(id)
    .then(course => {
      res.render('edit', { course, title: 'Edit Course' });
    })
    .catch(err => {
      console.log(err);
      res.status(404).render('404', { title: '404 Page Not Found' });
    });
});

// Route to handle the editing form submission
app.post('/staff/courses/edit/:id', (req, res) => {
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
});

// Route to render the staff view
app.get('/staff', (req, res) => {
  // Retrieve and render all courses for staff view
  Course.find()
    .then(courses => {
      res.render('staff', { title: 'Staff', courses });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
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
