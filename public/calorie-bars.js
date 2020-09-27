// adapted from CSS Animation's YouTube channel
let TDEE = {{ TDEE }};
let calories = {{ calories }};
let relativeTDEE;
let relativeCalories;
if (TDEE > calories) {
    relativeTDEE = 100;
    relativeCalories = calories / TDEE * 100;
} else {
    relativeCalories = 1;
    relativeTDEE = TDEE / calories * 100;
}
console.log(TDEE);
console.log(calories);
let calorieBar = document.getElementById('calorie-bar');
let scroll = window.requestAnimationFrame;
let isOnScreen = (element) => {
    let rectangle = element.getBoundingClientRect();
    return (
        rectangle.top >= 0 &&
        rectangle.left >= 0 &&
        rectangle.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        rectangle.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
}
let classChanger = () => {
    if (isOnScreen(calorieBar)) {
        document.getElementById('TDEE-bar').style.width = `${relativeTDEE}%`;
        document.getElementById('calorie-bar').style.width = `${relativeCalories}%`;
    } else {
        document.getElementById('TDEE-bar').style.width = "10vw";
        document.getElementById('calorie-bar').style.width = "10vw";
    }
    scroll(classChanger);
}
// classChanger();
window.addEventListener("scroll", classChanger());
window.addEventListener("load", classChanger());