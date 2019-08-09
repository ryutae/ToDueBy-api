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
