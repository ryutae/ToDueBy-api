const TasksService = {
    getTaskById(knex, id) {
        return knex
        .select(
            't.id AS task_id',
            't.project_id AS project_id',
            't.name AS task_name',
            't.description AS task_description',
            't.due_date AS task_due_date',
            't.created_by AS created_by_id',
            'U.first_name AS created_first_name',
            'U.last_name AS created_last_name',
            't.assigned_to AS assigned_to_id',
            'U2.first_name AS assigned_to_first_name',
            'U2.last_name AS assigned_to_last_name',
            't.date_completed AS date_completed',
            't.completed_by AS completed_by_id',
            'U3.first_name AS completed_by_first_name',
            'U3.last_name AS completed_by_last_name'
            )
        .from('tasks AS t')
        .leftJoin('users AS U', 't.created_by', 'U.id')
        .leftJoin('users AS U2', 't.assigned_to', 'U2.id')
        .leftJoin('users AS U3', 't.completed_by', 'U3.id')
        .where('t.id', id)
        .first()
    }
}
module.exports = TasksService