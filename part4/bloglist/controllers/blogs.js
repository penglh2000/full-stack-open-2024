const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  // Find out the identity of the user who is doing the operation
  const user = request.user

  if(!user) {
    return response.status(401).json({ error: 'Token missing or invalid' })
  }

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'Title and URL are required' })
  }

  const newBlog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes, // Set default value if 'likes' is missing
    user: user.id
  })

  const savedBlog = await newBlog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blogToDelete = await Blog.findById(request.params.id)

  if (!blogToDelete) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  // Find out the identity of the user who is doing the operation
  const user = request.user

  if(!user) {
    return response.status(401).json({ error: 'Token missing or invalid' })
  }

  // Compare the user ID of the authentication token with the user ID of the blog's creator
  if (blogToDelete.user.toString() !== user.id.toString()) {
    return response.status(403).json({ error: 'Permission denied' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: 'query' } //  On update operations, mongoose validators are off by default
  )
  response.status(200).json(updatedBlog)
})


module.exports = blogsRouter