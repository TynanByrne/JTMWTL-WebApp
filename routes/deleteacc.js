const express = require('express');
let router = express.Router();

// Delete their account
router.get('/', (req, res) => {
    let username = req.session.username;
    connection.query("DELETE users, forms FROM forms JOIN users ON forms.user_id = users.id WHERE username = ?", username, (error, results, fields) => {
        if (error) throw error;
        console.log(`User ${username} was successfully deleted from users.`);
        req.session.destroy((err) => {
            console.log("The user has logged out!");
            res.render('success', {
                title: 'Success', layout: 'index', successmsg: 'deleted your account.', whichNav: function () {
                    return 'navbar';
                }
            });
        });
    });
});

module.exports = router;