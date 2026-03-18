# Email Verification API

A Node.js backend service implementing email verification during user registration.

## Features

- User registration
- Email verification via token
- Login restriction for unverified users
- Token expiration (24 hours)
- Resend verification email
- Rate limiting for registration
- Verification status endpoint

## Tech Stack

Node.js  
Express.js  
MySQL  
Nodemailer  
bcrypt  

## Setup

1. Clone repository

git clone https://github.com/username/email-verification-api.git

2. Install dependencies

npm install

3. Create `.env`

EMAIL=your_email
EMAIL_PASSWORD=your_app_password

4. Start server

node app.js

Server runs on:

http://localhost:3000