const handlebars = require('express-handlebars');

function hbsHelpers(handlebars) {
    return handlebars.create({
        // Specify helper
        helpers: {
            if_eq: function (a, b, opts) {
                if (a === b) {
                    return opts.fn(this);
                } else {
                    return opts.inverse(this);
                }
            }
        }    
    });  
}

module.exports = hbsHelpers;