const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'test1',
      last_name: 'user',
      email: 'test1@test.com',
      password: 'P@ssw0rd',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      first_name: 'test2',
      last_name: 'user',
      email: 'test2@test.com',
      password: 'P@ssw0rd',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      first_name: 'test3',
      last_name: 'user',
      email: 'test3@test.com',
      password: 'P@ssw0rd',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      first_name: 'test4',
      last_name: 'user',
      email: 'test4@test.com',
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
      created_by: users[0].id
    },
    {
      id: 2,
      name: 'Project 2',
      description: 'project',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[1].id
    },
    {
      id: 3,
      name: 'Project 3',
      description: 'project',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[2].id
    },
    {
      id: 4,
      name: 'Project 4',
      description: 'project',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[3].id
    }
  ]
}

function makeTasksArray(users, projects) {
  return[
    {
      id: 1,
      project_id: projects[0].id,
      name: 'task 1',
      description: 'description',
      due_date: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      assigned_to: users[0].id,
      date_completed: null
    },
    {
      id: 2,
      project_id: projects[0].id,
      name: 'task 2',
      description: 'description',
      due_date: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      assigned_to: users[1].id,
      date_completed: null
    },
    {
      id: 3,
      project_id: projects[0].id,
      name: 'task 3',
      description: 'description',
      due_date: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      assigned_to: users[2].id,
      date_completed: null
    },
    {
      id: 4,
      project_id: projects[0].id,
      name: 'task 4',
      description: 'description',
      due_date: new Date('2029-01-22T16:28:32.615Z'),
      created_by: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      assigned_to: users[3].id,
      date_completed: null
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

  function seedProjectsTables(db, users, projects, tasks=[]) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('projects').insert(projects)
      // update the auto sequence to match the forced id values
      await trx.raw(
        `SELECT setval('projects_id_seq', ?)`,
        [projects[projects.length - 1].id],
      )
      // only insert tasks if there are some, also update the sequence counter
      if (tasks.length) {
        await trx.into('tasks').insert(tasks)
        await trx.raw(
          `SELECT setval('tasks_id_seq', ?)`,
          [tasks[tasks.length - 1].id],
        )
      }
    })
  }

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.email,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
  }

  function makeTasksFixtures() {
    const testUsers = makeUsersArray()
    const testProjects = makeProjectsArray(testUsers)
    const testTasks = makeTasksArray(testUsers, testProjects)
    return { testUsers, testProjects, testTasks }
  }

  module.exports = {
      cleanTables,
      makeAuthHeader,
      seedUsers,
      makeProjectsArray,
      makeUsersArray,
      makeTasksArray,
      makeTasksFixtures,
      seedProjectsTables
  }