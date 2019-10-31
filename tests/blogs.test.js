const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  } 
]

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of initialBlogs){
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('All blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body.length).toBe(initialBlogs.length)
})

test('Each blog has "id" property', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('Add a new blog successfully', async () => {
  const newBlog = {
    title: 'JavaScript: The Good Parts',
    author: 'Crockford D.',
    url: 'https://7chan.org/pr/src/OReilly_JavaScript_The_Good_Parts_May_2008.pdf',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)
  
  expect(response.body.length).toBe(initialBlogs.length + 1)
  expect(titles).toContain(
    'Go To Statement Considered Harmful'
  )
})

test('Each added blog has a "likes" property', async () => {
  const newBlog = {
    title: 'JavaScript: The Good Parts',
    author: 'Crockford D.',
    url: 'https://7chan.org/pr/src/OReilly_JavaScript_The_Good_Parts_May_2008.pdf'    
  } 
  
  const response = await api
    .post('/api/blogs')
    .send(newBlog)

  expect(response.status).toBe(200)
  expect(response.body.likes).toBeDefined()
})

test.only('Don\'t submit blog without "title" and "url" properties', async () => {
  const newBlog = {}

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    
  const response = await api.get('/api/blogs')
  expect(response.body.length).toBe(initialBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})