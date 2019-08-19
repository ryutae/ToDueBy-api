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
    .patch(jsonBodyParser, (req, res, next) => {
        const { name, description, due_date, assigned_to } = req.body
        const updatedTask = { name}
        for (const [key, value] of Object.entries(updatedTask)) 
            if (value == null) 
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        updatedTask.description = description
        if (due_date == '') {
            updatedTask.due_date = null
        } else {
            updatedTask.due_date = due_date
        }
        if (assigned_to == '') {
            updatedTask.assigned_to = null
        } else{
            updatedTask.assigned_to = assigned_to
        }
        TasksService.updateTask(req.app.get('db'), req.params.task_id, updatedTask)
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

tasksRouter
    .route('/:task_id/assign')
    .all(requireAuth)
    .all(checkTaskExists)
    .patch(jsonBodyParser, (req, res, next) => {
        const { assignTo } = req.body 
        const { task_id } = req.params
        TasksService.assignTask(req.app.get('db'), task_id, assignTo)
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

tasksRouter
    .route('/:task_id/complete')
    .all(requireAuth)
    .all(checkTaskExists)
    .post((req, res, next) => {
        const { task_id } = req.params
        const user_id = req.user.id
        TasksService.completeTask(req.app.get('db'), task_id, user_id)
        .then(() => {
            res.status(204).end()
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