const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'okapifinalproject', async (err, decodedToken) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        res.redirect('/login');
      } else {
        const { role } = decodedToken;

        console.log('Decoded Token:', decodedToken); 
        console.log('User Role:', role); 

        if (role === 'student' || role === 'teacher') {
          req.user = decodedToken;
          next();
        } else {
          console.log('Forbidden: Access denied for non-students and non-teachers.'); 
          res.status(403).send('Forbidden: Access denied for non-students and non-teachers.');
        }
      }
    });
  } else {
    res.redirect('/login');
  }
};


module.exports = { requireAuth };

