const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Users Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
   app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the tables', () => db.raw('TRUNCATE users, projects, userprojectref, tasks RESTART IDENTITY CASCADE'))
  // before('clean the tables', () => helpers.cleanTables(db))


  afterEach('cleanup', () => db.raw('TRUNCATE users, projects, userprojectref, tasks RESTART IDENTITY CASCADE'))
  // afterEach('cleanup', () => helpers.cleanTables(db))


  describe(`POST /api/users`, () => {
    it(`creates an user, responding with 201`, () => {
//expected user
      const newUser = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@test.org',
        password: 'P@ssw0rd'
      }
      return supertest(app)
        .post('/api/users/')
        .send(newUser)
        .expect(201)
    })
//validation for missing fields
    const requiredFields = ['first_name', 'last_name', 'email']
//iterate through each field
    requiredFields.forEach(field => {
      const newUser = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@test.org',
        password: 'P@ssw0rd'
      }
//test case for each missing field
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field]

        return supertest(app)
          .post('/api/users/')
          .send(newUser)
          .expect(400, {
            error: `Missing '${field}' in request body` 
          })
      })
    })
  })


})