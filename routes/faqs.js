const express = require('express');
const router = express.Router();

// Render FAQS page
router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('faqs', {
            title: 'Frequently Asked Questions', layout: 'index', whichNav: function () {
                return 'navbarlogged';
            }
        });
    } else {
        res.render('faqs', {
            title: 'Frequently Asked Questions', layout: 'index', whichNav: function () {
                return 'navbar';
            }
        });
    }
});

module.exports = router;