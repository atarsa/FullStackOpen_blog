const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1})
   
  response.json(blogs.map(blog => blog.toJSON()))
  
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const token = request.token

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id){
      return response.status(401).json({ error: 'token missing or invalid'})
    }

    console.log('decoded Token', decodedToken);
    const user = await User.findById(decodedToken.id)

    if (body.title && body.url){
      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        user: user._id
      })
    
      const savedBlog = await blog.save()
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
      response.json(savedBlog.toJSON())
    } else {
      response
        .status(400)
        .send('Title and url are required')
    } 
      
  } catch (exception) {
      next(exception)
  } 
})

blogsRouter.delete('/:id', async (request, response) => {
  const token  = request.token
       
  try {
    if (token !== undefined){
      const decodedToken = jwt.verify(token, process.env.SECRET)
      
      if (decodedToken.id){
        const userId = decodedToken.id
        const blog = await Blog.findById(request.params.id)
        
        // check if user has created this blog
        if ( blog.user.toString() === userId.toString()){
          await Blog.findByIdAndRemove(request.params.id)
          response.status(204).end()
        } else {
          response.status(401).json({ error: 'only authors can delete notes'})
        }
                
        
      } else {
        return response
          .status(401)
          .json({ error: 'token missing or invalid'})
      }
    } else {
      return response
          .status(401)
          .json({ error: 'token missing or invalid'})
    }
   
  } catch (exception){
    console.log(exception);
    response.status(400).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try{
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog.toJSON())
  } 
  catch (exception) {
    console.log(exception);
    response.status(400).send(exception)
  }
})

module.exports = blogsRouter