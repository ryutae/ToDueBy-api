const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Projects Endpoints', function() {
    let db

    before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
    })

    const { testUsers, testProjects, testTasks } = helpers.makeTasksFixtures()

    after('disconnect from db', () => db.destroy())

    before('clean the tables', () => db.raw('TRUNCATE users, projects, userprojectref, tasks RESTART IDENTITY CASCADE'))
    // before('clean the tables', () => helpers.cleanTables(db))


    afterEach('cleanup', () => db.raw('TRUNCATE users, projects, userprojectref, tasks RESTART IDENTITY CASCADE'))
    // afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/projects`, () => {
        beforeEach('insert users', () => {
            helpers.seedUsers(db, testUsers)
        })

        it('creates a group, responds with 201, and new project', () => {
            const testUser = testUsers[0]
            const newProject = {
                name: 'project',
                description: 'description',
                date_created: new Date('2019-08-05'),
                created_by: testUser.id
            }
            return supertest(app)
            .post('/api/projects')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newProject)
            .expect(201)
        })

        const requiredFields = ['name']

        requiredFields.forEach(field => {
        const testProject= testProjects[0]
        const testUser = testUsers[0]
        const newProject = {
            name: 'Test project',
            description: 'test',
            date_created: new Date('2019-08-05'),
            created_by: testUser.id
        }    

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
            delete newProject[field]
    
            return supertest(app)
              .post('/api/projects')
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .send(newProject)
              .expect(400, {
                error: `Missing '${field}' field in request body`,
              })
          })
        })
    })

    describe('GET /api/projects', () => {
        beforeEach('insert users', () => {
            helpers.seedUsers(db, testUsers)
        })
        it(`responds with 200 with valid authorization`, () => {
            return supertest(app)
            .get('/api/projects')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200)
        })
    })

    describe(`GET /api/projects/:project_id`, () => {
        context(`Given no projects`, () => {
          beforeEach(() =>
            helpers.seedUsers(db, testUsers)
          )
    
          it(`responds with 404`, () => {
            const projectId = 123456
            return supertest(app)
              .get(`/api/projects/${projectId}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(404, { error: `Project doesn't exist` })
          })
        })
    
        context('Given there are projects in the database', () => {
          beforeEach('insert projects', () =>
            helpers.seedProjectsTables(
              db,
              testUsers,
              testProjects,
              testTasks,
            )
          )
    
          it('responds with 200 and the specified project', () => {
            const projectId = 2
    
            return supertest(app)
              .get(`/api/projects/${projectId}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(200)
          })
        })
    })
})