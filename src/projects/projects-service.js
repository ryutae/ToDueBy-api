const config = require('../config')

const ProjectsService = {
    getProjectById(knex, id) {
        return knex
        .select('*')
        .from('projects')
        .where('id', id)
        .first()
    },
    getProjectByName(knex, name) {
        return knex
        .select('*')
        .from('projects')
        .where({ name })
        .first()
    },
    getProjectsForUser(knex, user_id) {
        return knex('projects').select('*')
        .innerJoin('userprojectref', 'projects.id', 'userprojectref.project_id')
        .where('userprojectref.user_id', '=', user_id)
        .orderBy('projects.id')
    },
    getAllProjects(knex) {
        return knex
        .select()
        .table('projects')
    },
    getJoinProjects(knex, user_id) {
        return knex
        .select('p.*')
        .from('projects AS p')
        .leftJoin('userprojectref AS up', function() {
            this.on('p.id', '=', 'up.project_id').andOn('up.user_id', '=', user_id)
        })
        .whereNull('up.user_id')
        // select * from projects p
        // left join userprojectref up on p.id = up.project_id and up.user_id = user_id
        // where up.user_id is null


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
    },
    getTasksForProject(knex, project_id) {
        return knex
        .select('*')
        .from('tasks')
        .where({project_id})
        .orderBy('id')
    },
    getUserProject(knex, project_id, user_id) {
        return knex
        .select('*')
        .from('userprojectref')
        .where({
          user_id : user_id,
          project_id: project_id
        })
        .first()
    },
    joinProject(knex, user_id, project_id) {
        return knex
        .insert({
            user_id: user_id,
            project_id: project_id
        })
        .into('userprojectref')
        .returning('*')
        .then(rows => rows[0])
    },
    getMembersInProject(knex, project_id) {
        return knex
        .select('up.project_id','u.*')
        .from('users AS u')
        .innerJoin('userprojectref AS up', 'u.id', 'up.user_id')
        .where('up.project_id', project_id)
    }
 
}

module.exports = ProjectsService