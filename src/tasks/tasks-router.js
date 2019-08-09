const express = require('express')
const tasksRouter = express.Router()
const path = require('path')
const TasksService = require('./tasks-service')
const { requireAuth } = require('../../middleware/jwt-auth')
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