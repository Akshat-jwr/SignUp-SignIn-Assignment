# SignUp-SignIn-Assignment

## Steps on how to run this locally on a machine:

Make sure you have the following installed on your system:<br/>
 Node.js (v16 or later recommended)<br/>
 MongoDB (either installed locally or use MongoDB Atlas)<br/>
 Git<br/>

1. Clone the Repository:
   (Run these commands on your terminal)<br/>
   git clone https://github.com/Akshat-jwr/SignUp-SignIn-Assignment.git<br/>
   cd SignUp-SignIn-Assignment<br/>

2. Create a database on MongoDB Atlas as its URI will be required in the .env file<br/>

3. Create a .env file in the Backend folder and add the following variables:<br/>
   MONGO_URI=your_mongodb_connection_string<br/>
   JWT_SECRET=your_jwt_secret_key<br/>
   PORT=5055<br/>
   EMAIL_USER=your_email@example.com<br/>
   EMAIL_PASS=your_email_password<br/>

4. Run npm install in your root directory in the terminal to install the required dependencies<br/>

5. To start the Backend server, run<br/>
    cd Backend<br/>
    node index<br/>
   in a terminal and ensure that the database is connected<br/>

7. To start the Frontend, run<br/>
    cd Client<br/>
    npm run dev<br/>
   in another terminal<br/>

For email functionality, make sure to enable Less Secure Apps (if using Gmail) or set up an app password.
