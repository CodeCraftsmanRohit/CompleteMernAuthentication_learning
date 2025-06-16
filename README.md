# CompleteMernAuthentication_learning

        Install :> express,cors,dotenv,nodemon,jsonwebtoken,mongoose,bcryptjs,nodemailer,cookie-parser.


************************Backend********************


step 1-> setup server using express

step 2-> create .env file

step 3-> mongodb atlas me databse defined kro  and ip config krna na bhulo

step 4-> connect express with mongodb database

step 5-> store user data in database by creating  user model

step 6->to create a  user, create a controller function(authController.js) and using that ,after, we will create an api end point,

 step 6.1 -> first create register controller function in authController.js

 step6.2 -> when user is cretaed and saved in DB , next we have to generate token(using id from mongodb DB) for authentication and send this using cookie.

 step 6.3 -> then create login and logout controller function  (logout me token remove hoga!)

 step 7 -> create api end point using controller function, for that we'll create routes

 step 8-> test apis using postman

 step 9 -> add nodemailer.js,we need smtp details to send the mail,use brevo smtp!!

 step 10-> create sendverifyOTP controller function and then verifyEmail controller function

 step 11-> need a middleware as user is only sending otp but we want userId and otp.(we r getting userdId from token and token is stored in cookie)(need a middleware to do work as a intermediator)

 step 12-> test send-verify-otp and verify-account api using postman

 step 13 -> add isAuthenticated controller function

 step 14 -> create sendResetOtp controller function and resetpassword controller then create api end point

step 15 -> create userController and userRoutes to get userdata




*************************************************
