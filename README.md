# This is the implementation portion of our ReadMe for CMPE 131.

## Download Instructions

### Use either GitHub Desktop or some Command Line Interface client to clone the repository.  

CLI Cloning Instructions:
  - Cloning with HTTPS: ``git clone https://github.com/KailenC/Bracket-Website-group-project.git``
  - Cloning with SSH: ``git clone git@github.com:KailenC/Bracket-Website-group-project.git``

Cloning with GitHub Desktop:  
  - Click "Current Repository" in the top left of the desktop application
  - Enter the "Add" dropdown menu and click “Clone Repository”
  - Click the “URL” option and enter the following URL: ``https://github.com/KailenC/Bracket-Website-group-project#``

## Installing Dependencies

This project uses Node.js for our backend and PostgreSQL for our database. Both need to be installed and added to the system path.

### Installing Node

Go to the official Node.js website and download the most recent version of Node. https://nodejs.org/en/download

### Adding Node to the System Path 

- Find and copy the path where Node is installed. 
- Search “Edit the system environment variables” on Windows
- Click on the "Environment Variables" button.
- Find the system variables section of the pop-out menu and left click on "Path"
- Press “Edit” and then “New” on this menu and paste in your Node path
  - Example Path: ``C:\Program Files\nodejs``

### Installing PostgreSQL

Go to the official PostgreSQL website and download the most recent version of PostgreSQL here https://www.postgresql.org/download/windows/

Run the installer and set a username and password. Be sure to remember these as they will be used in a .env file to run the database.

### Adding PostgreSQL to the System Path

- Find the bin subdirectory in the PostgreSQL installation path.
  - Example: C:\Program Files\PostgreSQL\18\bin
- Search “Edit the system environment variables” on Windows
- Click on the Environment Variables button.
- Find the system variables section of the pop-out menu and left click on Path
- Press “Edit” and then “New” on this menu and paste in your bin path

## Setting up a .env File

Navigate to the backend folder and create a new file called “.env”. Paste the following into the .env file. Make sure to edit the username and password to whatever was entered when setting up postgreSQL.

``DB_USER = "FIXME: YOUR POSTGRESQL USER NAME"``  
``DB_HOST = "localhost"``  
``DB_NAME = "usersdb"``  
``DB_PASSWORD = "FIXME: POSTGRESQL PASSWORD"``  
``DB_PORT = 5432``  
``JWT_SECRET="FIXME: ENTER ANYTHING YOU WANT HERE"``  

Once this is set up, ensure you are in the backend and run the following command:  
- ``npm install dotenv``

This will allow the backend to execute postgreSQL commands automatically.

## Initialize the database

To properly use the backend, a database that will store all of the necessary tables must be created. Run the following command but modify the “username” parameter with your chosen postgreSQL username.  
- ``psql -U username -c "CREATE DATABASE usersdb"``

Next, navigate to the backend and run ./reset-db on either Windows or Mac. This will create the tables inside of the usersdb database and fill them with some test users and tournaments.  **It is VERY IMPORTANT that you close the terminal instance that ran this command or the backend will not work properly.**

## Running the Code

Create two new terminal instances and have one cd into the frontend and the other cd into the backend.

Run ``npm start`` on both terminal instances. Now, the backend server should be running and the frontend should be accessible from http://localhost:3000/

## Demo

This is a link to the Demo video we recorded for this project: https://www.youtube.com/watch?v=46Z-msM1Eds
