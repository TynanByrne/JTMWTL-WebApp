const express = require('express');
const handlebars = require('express-handlebars');
let router = express.Router();
const mysql = require('mysql');

// Create the functions used to calc cals and macros
const BMIcalc = (weight, height) => {
    let BMI = weight / Math.pow(height, 2);
    return BMI.toFixed(1);
}
const maleBMR = (weight, height, age) => {
    return((10 * weight) + (6.25 * 100 * height) - (5 * age) + 5);
}
const femaleBMR = (weight, height, age) => {
    return((10 * weight) + (6.25 * 100 * height) - (5 * age) - 161);
}
const TDEECalc = (sex, weight, height, age) => {
    let TDEE;
    if (sex === "female") {
        TDEE = femaleBMR(weight, height, age) * 1.55;   
    } else {
        TDEE = maleBMR(weight, height, age) * 1.55;
    }
    return Math.round(TDEE);
}
const calorieCalc = (TDEE, sex, goals) => {
    let calorieGoal;
    if (sex === "female") {
        if (goals === "build muscle" || goals == "get strong") {
            calorieGoal = 200 + TDEE;
        } else {
            calorieGoal = TDEE - 400;
        }     
    } else {
        if (goals === "build muscle" || goals == "get strong") {
            calorieGoal = 250 + TDEE;
        } else {
            calorieGoal = TDEE - 500;
        }
    }
    return Math.round(calorieGoal);
}
const macroCalc = (carbs, calories, weight) => {
    let proteins = Math.round(weight * 2.2);
    let fats;
    switch(carbs) {
        case("lowcarb"):
            fats = Math.round((calories * 0.4) / 9);
            break;
        case("balanced"):
            fats = Math.round((calories * 0.3) / 9);
            break;
        case("highcarb"):
            fats = Math.round((calories * 0.2) / 9);
            break;
    }
    let carbohydrates = Math.round((calories - proteins * 4 - fats * 9) / 4);
    function Macros(proteins, fats, carbohydrates) {
        this.proteins = proteins;
        this.fats = fats;
        this.carbohydrates = carbohydrates;
    }
    let macros = new Macros(proteins, fats, carbohydrates);
    return macros;
}

// Connects to an existing mysql server
const connection = mysql.createConnection({
    host: process.env.NODE_ENV === "production" ? process.env.DB_HOSTNAME : 'localhost',
    user: process.env.NODE_ENV === "production" ? process.env.DB_USER : 'root',
    password: process.env.NODE_ENV === "production" ? process.env.DB_PASSWORD : 'password',
    database: process.env.NODE_ENV === "production" ? process.env.DATABASE : 'fitnessapp',
    port: '3306'
});
// Check the connection to the db is working
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected! Nice!");
});


// Render home page
router.get('/', (req, res, next) => {
    // Check if they've logged in
    if (req.session.loggedin) {
        const username = req.session.username;
        let sql = ("SELECT sex, age, weight, height, experience, goals, frequency, carbs FROM forms JOIN users ON forms.user_id = users.id WHERE username = ?")
        connection.query(sql, username, (error, results, fields) => {
            if (!results || results.length != 1) {
                console.log(results.length);
                console.log(results);
                console.log("HELLO!");
                res.render('main', {
                    title: 'Train more!', whichNav: function () {
                        return 'navbarlogged';
                    }, layout: 'index', loggedin: true
                });
                console.log("They logged in!");
            } else {
                const sex = results[0].sex;
                const age = results[0].age;
                const weight = results[0].weight;
                const height = results[0].height;
                const experience = results[0].experience;
                const carbs = results[0].carbs;
                const goals = results[0].goals;
                const frequency = results[0].frequency;
                console.log(`${sex}, ${age}, ${weight}, ${height}, ${experience}, ${carbs}, ${goals}, ${frequency}`)
                console.log(results);
                let TDEE = TDEECalc(sex, weight, height, age)
                let totalCals = calorieCalc(TDEE, sex, goals);
                let macros = macroCalc(carbs, totalCals, weight);
                let BMI = BMIcalc(weight, height);
                let proteins = macros.proteins;
                let fats = macros.fats;
                let carbohydrates = macros.carbohydrates;

                console.log(totalCals);
                console.log(macros);
                console.log(BMI);

                res.render('main', {
                    title: 'Your own plan', whichNav: function () {
                        return 'navbarlogged';
                    }, layout: 'index', loggedin: true, BMI: BMI, proteins: proteins, fats: fats, carbohydrates: carbohydrates, 
                        calories: totalCals, username: username, TDEE: TDEE, goals: goals, frequency: frequency, experience: experience
                });
            }
        })

    } else {
        console.log("They haven't logged in!");
        res.render('main', {
            title: 'Train more!', whichNav: function () {
                return 'navbar';
            }, layout: 'index', loggedin: false
        })
    }
});

module.exports = router;