# **Hello!**
## This is the work in progress README that we have for our CMPE 131 Project.

We currently plan utalizing a tech stack of React for our frontend, Node + Express for our backend, and a PostgreSQL database that we may host on Docker in the future.

As we work on our project backlog, feel free to suggest other languages and/or frameworks that could make tasks easier because Kailen and I have minimal project expierience.
Also, If you guys are ever working on some feature and feel that it could use a section in our README due to its importance or complexity, do not hesitate to add either a little
blurb or a ToDo note for later :)

## **Mac Instructions**
!!! for mac you need to run: ``brew install`` node in terminal

After install, you can run "npm start" in frontend or backend file

## **Windows Instructions**

### **Node.js**
Install Node.js from the offical website: https://nodejs.org/en/download

(I downloaded the installer but downloading the binary might work as well)

Find the location of the installed node.js folder and copy the path. The default installation path is routed into Program Files  
- Example of my Copied Path: ``C:\Program Files\nodejs``

Next, search "Edit the system environment variables" in the Windows Search bar and go to the "Environment Variables" button at the bottom

Under User Variables (The top section of the pop-out), click New and then set  
- Variable Name: ``Node.js``
- Variable Value: ``C:\Program Files\nodejs``

To verify if this worked, run ``node --version`` in your teminal.

Now you are able to use the Node Package Manager (npm) to install dependencies!

### **Repo Setup**
Install Git Bash / Have a terminal that you can actually run commands in (I love windows)  

Now, Navigate to your desired directory location then open your terminal and type:

``git clone git@github.com:KailenC/Bracket-Website-group-project.git``

This will clone the current contents of the repo into your desired folder.

### Installing Dependencies
In the project's folder, enter the following commands:
- ``npm install express``
- ``npm install react``
- ``npm install react-scripts``

To verify if this worked try the following:
- ``cd backend ``
- ``npm start``
- When going to http://localhost:8080/ the output should be "Server is working!"
-  Ctrl + C to close this


To test the frontend, try the following:
- ``cd frontend  ``
- ``npm install react-router-dom``
- ``npm start``
-  http://localhost:3000 should open automatically with the react Logo
-  Ctrl + C to close this

### **Other notes (Took a ton of time originally debugging):**
- Dont use the psql command in bash, the terminal is not privaleged enough
- If you setup postgreSQL via the installer on windows, default username is postgres
- 
I really hope this makes it easier bc I was tweaking setting this up :(

## **Helpful Software and Extensions**
### **Postman**
- API testing tool that can observe the response to get and post requests (Very useful when backend and frontend are out of date)
- Can be installed at https://www.postman.com/downloads/

### **VScode Extensions**
- PostgreSQL by Chris Klokman
  - Allows visualization of a database without directly using the psql shell
 
## **PSQL Commands**
The following are useful commands to use the psql shell to interact with your database

To access the temrinal where info will be displayed , open the psql shell and press enter until the password field is displayed
- Enter your superuser password if on windows
- Not required on Mac as far as I know

To create and access the database we will use, enter:
- `CREATE DATABASE usersdb;`
- `\c usersdb;`

Then paste the following command in:
- `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password TEXT
);`

Now the database should be properly setup on your machine. To check if users are being added, run the following
-  `select * from users;`

This should print all of the contents entered in the database.
  

## **GitHub Basics** 
for reference if you forget or want a referesher and if you use the terminal ( i personally reference a lot cause i have weak memory)

git branch → check which branch

git checkout main → switch to main branch

git pull origin main --rebase → sync with GitHub

git checkout -b new-feature → create branch (if needed)


Make changes locally: (what you use a lot)

git add . → stage changes

git commit -m "message" → commit changes

git push -u origin new-feature → upload to GitHub


after you push you should discard the branch or just keep track of what you are pushing to main or else you might come across problem but nothing chat cant solve with stashing...

