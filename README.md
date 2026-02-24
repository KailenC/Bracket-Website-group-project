# **Hello!**
## This is the work in progress README that we have for our CMPE 131 Project.

We currently plan utalizing a tech stack of React for our frontend, Node + Express for our backend, and a PostgreSQL database that we may host on Docker in the future.

As we work on our project backlog, feel free to suggest other languages and/or frameworks that could make tasks easier because Kailen and I have minimal project expierience.
Also, If you guys are ever working on some feature and feel that it could use a section in our README due to its importance or complexity, do not hesitate to add either a little
blurb or a ToDo note for later :)

## **Mac Instructions**
!!! for mac you need to run: brew install node in terminal

After install, you can run "npm start" in frontend or backend file

## **Windows Instructions**

### **Node.js**
Install Node.js from the offical website: https://nodejs.org/en/download

(I downloaded the installer but downloading the binary might work as well)

Find the location of the installed node.js folder and copy the path. The default installation path is routed into Program Files  
- Example of my Copied Path: ``C:\Program Files\nodejs``

Next, search "Edit the system environment variables" in the Windows Search bar and go to the "Environment Variables" button at the bottom

Under User Variables (The top section of the pop-out), click New and then set  
- Variable Name: Node.js
- Variable Value: C:\Program Files\nodejs

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
- ``npm start``
-  http://localhost:3000 should open automatically with the react Logo
-  Ctrl + C to close this

I really hope this makes it easier bc I was tweaking setting this up :(

