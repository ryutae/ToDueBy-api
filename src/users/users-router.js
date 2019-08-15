const express = require('express')
const usersRouter = express.Router()
const UsersService = require('./users-service')
const path = require('path')
const jsonBodyParser = express.json()
const { requireAuth } = require('../../middleware/jwt-auth')

usersRouter
    .post('/', jsonBodyParser, (req, res, next) => {
        const { first_name, last_name, email, password } = req.body
        //make sure all fields are submitted
        for (field of ['first_name', 'last_name', 'email', 'password']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }
        //make sure password is valid
        const passwordError = UsersService.validatePassword(password)
        if (passwordError) {
            return res.status(400).json({error: passwordError})
        }
        //make sure email has not been used
        UsersService.userWithEmailAlreadyExists(req.app.get('db'), email)
        .then(userEmailExists => {
            //return error if user with email already exists
            if (userEmailExists) {
                return res.status(400).json({error: `email already used`})
            }
            return UsersService.hashPassword(password)
            .then(hashedPassword => {
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    password: hashedPassword,
                    date_created: 'now()'
                }

                return UsersService.insertUser(req.app.get('db'), newUser)
                .then(user => {
                    res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                    .json(user)
                })
            })
        })
        .catch(next)
    })

usersRouter
    .route('/myopentasks')
    .get(requireAuth, (req, res, next) => {
        const user_id = req.user.id
        console.log(`user_id: ${user_id}`)
        UsersService.getMyOpenTasks(req.app.get('db'), user_id)
        .then(tasks => {
            res.status(200).json(tasks)
        })
        .catch(next)
    })
module.exports = usersRouter