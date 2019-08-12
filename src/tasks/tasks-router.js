const express = require('express')
const tasksRouter = express.Router()
const path = require('path')
const TasksService = require('./tasks-service')
const { requireAuth } = require('../../middleware/jwt-auth')
const jsonBodyParser = express.json()

tasksRouter
    .route('/:task_id')
    .all(requireAuth)
    .all(checkTaskExists)
    .get((req, res, next) => {
        TasksService.getTaskById(req.app.get('db'), req.params.task_id)
        .then(task => {
            res.status(200).json(task)
        })
        .catch(next)
    })

tasksRouter
    .route('/')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const { project_id, name, description, due_date, assigned_to } = req.body
        const newTask = {project_id, name}
        for (const [key, value] of Object.entries(newTask)) 
            if (value == null) 
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        newTask.created_by = req.user.id
        newTask.description = description
        if (due_date == '') {
            newTask.due_date = null
        } else {
            newTask.due_date = due_date
        }
        if (assigned_to == '') {
            newTask.assigned_to = null
        } else{
            newTask.assigned_to = assigned_to
        }
        console.log(newTask)
        TasksService.insertTask(req.app.get('db'), newTask)
        .then(task => {
            res.status(201)
            .location(path.posix.join(req.originalUrl, `/${task.id}`))
            .json(task)
        })
        .catch(next)
    })

async function checkTaskExists(req, res, next) {
    try {
        const task = await TasksService.getTaskById(
        req.app.get('db'),
        req.params.task_id
        )
        if (!task)
        return res.status(404).json({
            error: `Task doesn't exist`
        })
    
        res.task = task
        next()
    } catch (error) {
        next(error)
    }
    }

module.exports = tasksRouter