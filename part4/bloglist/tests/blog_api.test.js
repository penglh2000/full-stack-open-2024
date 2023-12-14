const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

// 4.8.
test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

// 4.9.
test('all blogs have a unique identifier property named id', async () => {
  const response = await api.get('/api/blogs')

  // Check that each blog in the response has an "id" property
  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})

// 4.10.
test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 5
  }

  const initialBlogs = await helper.blogsInDb()

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  // Ensure that the total number of blogs has increased by one
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

  // Check that the content of the new blog is saved correctly
  const addedBlog = response.body
  expect(addedBlog.title).toBe(newBlog.title)
  expect(addedBlog.author).toBe(newBlog.author)
  expect(addedBlog.url).toBe(newBlog.url)
  expect(addedBlog.likes).toBe(newBlog.likes)
})

// 4.11.
test('default likes to 0 if missing in the request', async () => {
  const newBlog = {
    title: 'Blog Without Likes',
    author: 'Test Author',
    url: 'http://blogwithoutlikes.com',
  }

  const initialBlogs = await helper.blogsInDb()

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  // Ensure that the total number of blogs has increased by one
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

  // Check that the content of the new blog is saved correctly
  const addedBlog = response.body
  expect(addedBlog.likes).toBe(0) // Check that 'likes' defaults to 0
})

// 4.12.
test('creating a new blog without title responds with 400 Bad Request', async () => {
  const newBlog = {
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('creating a new blog without url responds with 400 Bad Request', async () => {
  const newBlog = {
    title: 'Test Blog',
    author: 'Test Author',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

// 4.13.
test('deleting a blog by ID', async () => {
  const newBlog = {
    title: 'Blog to Delete',
    author: 'Author to Delete',
    url: 'http://blogtodelete.com',
    likes: 5,
  }
  // Create a new blog to be deleted
  const createdBlog = await api.post('/api/blogs').send(newBlog)
  // Get the ID of the created blog
  const blogId = createdBlog.body.id
  const initialBlogs = await helper.blogsInDb()
  // Delete the blog by ID
  await api
    .delete(`/api/blogs/${blogId}`)
    .expect(204)
  const blogsAtEnd = await helper.blogsInDb()
  // Ensure that the total number of blogs has decreased by one
  expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)

})

// 4.14.
test('updating a blog by ID', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const updatedBlog = {
    title: 'Updated Blog',
    author: 'Updated Author',
    url: 'http://updatedblog.com',
    likes: 10,
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()

  // Check that the total number of blogs remains the same
  expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

  // Check that the content of the updated blog is saved correctly
  const updatedBlogInDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
  expect(updatedBlogInDb.title).toBe(updatedBlog.title)
  expect(updatedBlogInDb.author).toBe(updatedBlog.author)
  expect(updatedBlogInDb.url).toBe(updatedBlog.url)
  expect(updatedBlogInDb.likes).toBe(updatedBlog.likes)
})

afterAll(async () => {
  await mongoose.connection.close()
})