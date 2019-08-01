const express = require('express')
const UsersService = require('./users-service')
const path = require('path')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/')
    //create a new user
    .post(jsonBodyParser, (req, res, next) => {
        const { first_name, last_name, email, password } = req.body
        //make sure all fields are submitted
        for (element of [first_name, last_name, email, password]) {
            if (!req.body[element]) {
                return res.status(400).json({
                    error: `Missing ${element} in request body`
                })
            }
        }
        //make sure password is valid
        if (UsersService.validatePassword(password)) {
            return res.status(400).json({error: UsersService.validatePassword(password)})
        }
        //make sure email has not been used
            //return error if user with email already exists
        UsersService.userWithEmailAlreadyExists(req.app.get('db'), email)
        .then(userEmailExists => {
            if (userEmailExists) {
                return res.status(400).json({error: `email already used`})
            }
            return UsersService.hashPassword(password)
            .then(hashedPassword => {
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    password,
                    date_created: 'now()'
                }

                return UsersService.insertUser(req.app.get('db', newUser)
                .then(user => {
                    res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${id}`))
                    .json(UsersService.serializeUser(user))
                })
            })
            .then()
        })
        //hash password

        //insert user to users table with service

        //return 201 status




    })