const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const User = require('../models/user')


describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await User.find({})
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  

})

describe('new user creation fails with proper status code and message if:', () => {
  test('username/password missing', async () => {
    const usersAtStart = await User.find({})
    const newUser = {
      name: "aga"
    }
    
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` or `password` missing')

    const usersAtEnd = await User.find({})
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('username length less than 3 characters', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: "JD",
      name: "Jane Doe",
      password: "secret"
    }
    
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` must be at least 3 characters long')

    const usersAtEnd = await User.find({})
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
  
  test('password length less than 3 characters', async () => {
    const usersAtStart = await User.find({})

    const newUser = {
      username: "Jane",
      name: "Jane Doe",
      password: "12"
    }
    
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`password` must be at least 3 characters long')

    const usersAtEnd = await User.find({})
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})


afterAll(() => {
  mongoose.connection.close()
})