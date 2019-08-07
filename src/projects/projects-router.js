const express = require('express')
const jsonBodyParser = express.json()
const projectsRouter = express.Router()
const { requireAuth } = require('../../middleware/jwt-auth')
const ProjectsService = require('./projects-service')
const path = require('path')

projectsRouter
.route('/')
.post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { name, description } = req.body
    const newProject = { name, description }
    //check required fields
    if (name == null) {
        return res.status(400).json({error: `Missing 'name' field in request body`})
    }
    newProject.created_by = req.user.id
    ProjectsService.insertProject(req.app.get('db'), newProject)
    .then(project => {
        res.status(201)
        .location(path.posix.join(req.originalUrl, `/${project.id}`))
        .json(project)
    })
    .catch(next)
})
.get(requireAuth, (req, res, next) => {
    const user_id = req.user.id
    ProjectsService.getProjectsForUser(req.app.get('db'), user_id)
    .then(projects => {
        return res.status(200).json(projects)
    })
    .catch(next)
})


module.exports = projectsRouter