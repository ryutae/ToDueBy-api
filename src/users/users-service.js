const bcrypt = require('bcryptjs')
const config = require('../config')

const UsersService = {
    userWithEmailAlreadyExists(db, email) {
        return db
        .select()
        .from('users')
        .where('email', email)
        .first()
    },
    insertUser(db, newUser) {
        return db
        .insert(newUser)
        .into('users')
        .returning('*')
        .then(rows => rows[0])
    },
    validatePassword(password) {
        if (password.length < 8) {
            return `Password should be longer than 8 characters`
        }
        if (password.length > 72) {
            return `Password should be less than 72 characters`
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/.test(password)) {
            return 'Password must contain one upper case, lower case, number and special character'
        }
        return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    deleteUser(db, user_id) {
        return knex
        .del()
        .from('users')
        .where('id', user_id)
    },
    updateUser(db, user_id, updatedUser) {
        return knex('users')
        .update(updatedUser)
        .where('id', user_id)
        .returning('*')
    },
    serializeUser(user) {
        return {
            id: user.id,
            first_name: xss(user.first_name),
            last_name: xss(user.last_name),
            email: xss(user.emails),
            date_created: new Date(user.date_created)
        }
    },
    getMyOpenTasks(knex, user_id) {
        return knex
        .select('*')
        .from('tasks')
        .where({
            assigned_to: user_id
        })
        .whereNull('completed_by')
        .orderBy('due_date')
    },
    getMyCreatedTasks(knex, user_id) {
        return knex
        .select('*')
        .from('tasks')
        .where({
            created_by: user_id
        })
        .orderBy('date_created', 'desc')
    },
    getMyCompletedTasks(knex, user_id) {
        return knex
        .select('*')
        .from('tasks')
        .where({
            completed_by: user_id
        })
        .orderBy('date_completed', 'desc')
    }

}

module.exports = UsersService