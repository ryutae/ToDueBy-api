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

projectsRouter
    .route('/:project_id')
    .all(requireAuth)
    .all(checkProjectExists)
    .get((req, res) => {
        ProjectsService.getProjectById(req.app.get('db'), req.params.project_id)
        .then(project => {
            res.status(200).json(project)
        })

    })

/* async/await syntax for promises */
async function checkProjectExists(req, res, next) {
    try {
      const project = await ProjectsService.getProjectById(
        req.app.get('db'),
        req.params.project_id
      )
  
      if (!project)
        return res.status(404).json({
          error: `Project doesn't exist`
        })
  
      res.project = project
      next()
    } catch (error) {
      next(error)
    }
}

module.exports = projectsRouter