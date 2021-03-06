<h1>Just Tell Me What To Lift</h1>

Site is hosted with Heroku and can be visited: https://jtmwtl-fitnessapp.herokuapp.com/

Video showing and explaining the project can be found at: https://youtu.be/5nws8_f8v_o

As a big fitness fan, I decided to create a website that generates fitness plans for users after they
answer some simple questions. After doing so, they receive a calorie target, workout plan and a write
up of the strategy they should take to reach their goals. This is all completely custom to them, and
aims to take the complexity of fitness away for the average person.

I decided to use <b>Node.js</b> for this app, in conjunction with Express and Handlebars to set up my server.
This allowed me to set up all my pages and routes, and have a templating engine with views and partials
to clean up the HTML used to render each page. I had <b>never used any of these technologies before</b>, so
I had to read through a lot of documentation and watch a lot of videos in order to understand the tools
enough to put all of the pieces together.

In order to store user data, I used <b>MySQL</b> within Node to get a database running. I had used SQLite3 during
CS50x which thankfully made MySQL very easy to pick up.The schema only consists of two tables: one for users
and one for the forms that each user can submit. These entries can be updated, with functionality to resubmit
forms and hence update the 'forms' table, and users being able to change their passwords. Users may also 
choose to delete their account if they wish.

<bPasswords were hashed</b> and encrypted using the bcrypt npm module, so I cannot view the password of a user
even when I go into the MySQL database and have a look myself.

The app works by taking the data that the user inputs and using functions I created to simulate well
researched formulae in fitness, namely the Mifflin St Jeor equation. This allowed me to return how many
calories each individual user would need based on their stats and their goals. The workout plan and strategy
was based on simple logic to render only the fitness plan that would align with the things they chose.

In order to display this data, I relied upon pure <b>CSS</b> to create a nice looking website with animations,
transitions and a consistent colour scheme. These animations are seen throughout, such as the calorie
target bars stretching in size when they appear on the screen, or the FAQ answers appearing and changing
colour when hovered over.

Here is a gif of the <b>responsive design</b> I used. Just three breakpoints were needed:
![Responsive design](JTMWTL.gif)

Speaking of which, for some of the more involved interactivity I used vanilla JavaScript to give the site
a bit more to it. This includes the aforementioned animations depending upon whether the calorie bar was in
the viewport, or the delete account button showing a hidden warning when pressed to make the UI a bit more
forgiving.

All in all, it was a lot of work over about 1 month but I'm proud of what I've achieved and I've learned so much.
I hope someone gets some use out of this site when I host it, and I hope I carry on messing with the front and the
back end in order to make useful applications.
