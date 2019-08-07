const config = require('../config')

const ProjectsService = {
    getProjectById(knex, id) {
        return knex
        .select('*')
        .from('projects')
        .where('id', id)
        .first()
    },
    getProjectsForUser(knex, user_id) {
        return knex
        .select('*')
        .from('projects')
        .innerjoin('userprojectref', 'projects.id', 'userprojectref.project_id')
        .innerjoin('users', 'users.id', 'userprojectref.user_id')
        .where('users.id', user_id)
    },
    insertProject(knex, newProject) {
        return knex
        .insert(newProject)
        .into('projects')
        .returning('*')
        .then(rows => rows[0])
    },
    deleteProject(knex, id) {
        return knex
        .del()
        .from('projects')
        .where({ id })
    },
    updateProject(knex, id, updatedProject) {
        return knex('projects')
        .update(updatedProject)
        .where({ id })
        .returning('*')
    }

}

module.exports = ProjectsService