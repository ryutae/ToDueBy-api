const knex = require('knex')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')
const app = require('../src/app')


describe.only('Auth Endpoints', () => {
    let db 

    const { testUsers } = helpers.makeTasksFixtures()
    const testUser = testUsers[0]

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

    describe(`POST /api/auth/login`, () => {
        beforeEach('insert users', () => {
            helpers.seedUsers(db, testUsers)
        })
        
        const requiredFields = ['email', 'password']
        
        requiredFields.forEach(field => {
            const loginAttemptBody = {
                email: testUser.email,
                password: testUser.password,
            }
            
            it(`responds with 400 required error when '${field}' is missing`, () => {
                delete loginAttemptBody[field]
                
                return supertest(app)
                .post('/api/auth/login')
                .send(loginAttemptBody)
                .expect(400, {
                    error: `Missing '${field}' in request body`,
                })
            })
        })

        it(`responds with 400 'invalid email or password' when bad email`, () => {
            const invalidUserEmail = { email: 'ummmmmm', password: 'password'}
            return supertest(app)
            .post('/api/auth/login')
            .send(invalidUserEmail)
            .expect(400, { error: `Incorrect email or password`})
        })

        it(`responds with 400 'invalid email or password' when bad password`, () => {
            const invalidUserPassword = { email: testUser.email, password: 'incorrect'}
            return supertest(app)
            .post('/api/auth/login')
            .send(invalidUserPassword)
            .expect(400, { error: `Incorrect email or password`})
        })

        it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
            const userValidCreds = {
              email: testUser.email,
              password: testUser.password,
            }
            const expectedToken = jwt.sign(
              { user_id: testUser.id },
              process.env.JWT_SECRET,
              {
                subject: testUser.email,
                algorithm: 'HS256',
              }
            )
            return supertest(app)
              .post('/api/auth/login')
              .send(userValidCreds)
              .expect(200)
        })


    })
        
})  