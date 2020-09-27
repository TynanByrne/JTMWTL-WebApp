const express = require('express');
let router = express.Router();

// Render about page
router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('about', {
            title: 'About', layout: 'index', whichNav: function () {
                return 'navbarlogged';
            }
        });
    } else {
        res.render('about', {
            title: 'About', layout: 'index', whichNav: function () {
                return 'navbar';
            }
        });
    }
});

module.exports = router;