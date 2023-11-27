const express = require('express');
const morgan = require('morgan');
const path = require('path');

// express app
const app = express();

// set the view engine to EJS
app.set('view engine', 'ejs');

// listen for requests
app.listen(3000);

// middleware & static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

// routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/courses', (req, res) => {
  res.render('courses', { title: 'Courses' });
});

app.get('/students', (req, res) => {
  res.render('students', { title: 'Students' });
});

app.get('/staff', (req, res) => {
  res.render('staff', { title: 'Staff' });
});

// handle 404 errors
app.use((req, res) => {
  res.status(404).render('404', { title: '404 Page Not Found' });
});