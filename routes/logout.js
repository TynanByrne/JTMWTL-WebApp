const express = require('express');
let router = express.Router();

// Log the user out
router.get('/', (req, res) => {
    req.session.destroy((err) => {
        console.log("The user has logged out!");
        res.redirect('/');
    });
});

module.exports = router;