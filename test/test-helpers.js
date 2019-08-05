const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'test1',
      last_name: 'user',
      email: 'test1@test.com'
      password: 'P@ssw0rd',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      first_name: 'test2',
      last_name: 'user',
      email: 'test2@test.com'
      password: 'P@ssw0rd',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      first_name: 'test3',
      last_name: 'user',
      email: 'test3@test.com'
      password: 'P@ssw0rd',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      first_name: 'test4',
      last_name: 'user',
      email: 'test4@test.com'
      password: 'P@ssw0rd',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeProjectsArray(users) {
  return [
    {
      id: 1,
      name: 'Project 1',
      description: 'project',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[0]
    },
    {
      id: 2,
      name: 'Project 2',
      description: 'project',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[1]
    },
    {
      id: 3,
      name: 'Project 3',
      description: 'project',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[2]
    },
    {
      id: 4,
      name: 'Project 4',
      description: 'project',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[3]
    },
  ]
}


function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
          users,
          projects,
          userprojectref,
          tasks`
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE projects_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE userprojectref_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE tasks_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
          trx.raw(`SELECT setval('projects_id_seq', 0)`),
          trx.raw(`SELECT setval('userprojectref_id_seq', 0)`),
          trx.raw(`SELECT setval('tasks_id_seq', 0)`),
        ])
      )
    )
  }

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
  }

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.email,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
  }

  module.exports = {
      cleanTables,
  }