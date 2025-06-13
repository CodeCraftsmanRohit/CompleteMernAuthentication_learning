# CompleteMernAuthentication_learning

        Install :> express,cors,dotenv,nodemon,jsonwebtoken,mongoose,bcryptjs,nodemailer,cookie-parser.

step 1-> setup server using express

step 2-> create .env file

step 3-> mongodb atlas me databse defined kro  and ip config krna na bhulo

step 4-> connect express with mongodb database

step 5-> store user data in database by creating  user model

step 6->to create a  user, create a controller function(authController.js) and using that ,after, we will create an api end point,

 step 6.1 -> first create register controller function

 step6.2 -> when user is cretaed and saved in DB , next we have to generate token(using id from mongodb DB) for authentication and send this using cookie.