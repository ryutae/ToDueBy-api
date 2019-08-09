const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Tasks Endpoints', function() {
  let db

  const { testUsers, testProjects, testTasks } = helpers.makeTasksFixtures()


  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe('POST /api/tasks', () => {
    beforeEach('insert tasks', () => 
      helpers.seedProjectsTables(
        db, testUsers, testProjects
      )
    )

    it(`creates a task, responds with 201 and new task`, () => {
      const newTask = {
        project_id: 1,
        name: 'test', 
        description: 'test', 
        due_date: '2019-08-10', 
        assigned_to: 2
      }

      return supertest(app)
      .post('/api/tasks')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .send(newTask)
      .expect(201)
    })

    const requiredFields = ['project_id', 'name']
    requiredFields.forEach(field => {
      const testUser = testUsers[0]
      const newTask = {
        project_id: 1,
        name: "test task",
      }

      it(`returns 400 when missing '${field}'`, () => {
          delete newTask[field]

          return supertest(app)
          .post('/api/tasks')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newTask)
          .expect(400, {error: `Missing '${field}' in request body`})
      })
    })
  })

  describe('GET /api/tasks/:task_id', () => {
    context(`Given no projects`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        return supertest(app)
        .get('/api/tasks/11321')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(404)
      })
    })
    
    context('Given projects and tasks exist', () => {
      beforeEach('insert data', () => {
        helpers.seedProjectsTables(
          db,
          testUsers,
          testProjects,
          testTasks
          )
      })

      it('responds with 404 when task does not exist', () => {
        return supertest(app)
        .get('/api/tasks/1234')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(404)
      })

      it(`responds with 200 when task exists`, () => {
        return supertest(app)
        .get('/api/tasks/1')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
      })
    })
  })
})
