const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'okapifinalproject', async (err, decodedToken) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        res.redirect('/login');
      } else {
        // Assuming decodedToken contains user details, including the role
        const { role } = decodedToken;

        // Add a check for the user's role
        if (role === 'teacher' || role === 'student') {
          // User has the required role, proceed to the next middleware or route
          req.user = decodedToken; // Attach user details to the request
          next();
        } else {
          // Unknown role or unexpected value
          res.status(403).send('Forbidden: Unknown role or unexpected value.');
        }
      }
    });
  } else {
    res.redirect('/login');
  }
};

module.exports = { requireAuth };

