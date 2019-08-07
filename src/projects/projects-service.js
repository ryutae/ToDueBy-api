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
        return knex('projects').select('*')
        .innerJoin('userprojectref', 'projects.id', 'userprojectref.project_id')
        .where('userprojectref.user_id', '=', user_id)
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