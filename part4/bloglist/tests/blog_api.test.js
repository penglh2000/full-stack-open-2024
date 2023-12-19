const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  // Create or find a test user with the specified password
  let user = await User.findOne({ username: 'test' })
  if (!user) {
    await api
      .post('/api/users')
      .send({ username: 'test', name: 'test', password: 'test' })
  }

  // Log in and obtain the authentication token
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'test', password: 'test' })
  token = loginResponse.body.token
})

describe('blogs are returned in the expected format', () => {
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
})


describe('adding a new blog', () => {
  // 4.10.
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'http://testblog.com',
      likes: 5,
    }
    const initialBlogs = await helper.blogsInDb()
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Set the Authorization header
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
      url: 'http://blogwithoutlikes.com'
    }
    const initialBlogs = await helper.blogsInDb()
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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
      likes: 5
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('creating a new blog without url responds with 400 Bad Request', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      likes: 5
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  // 4.23.
  test('creating a new blog without without a token responds with 401 Unauthorized', async () => {
    const newBlog = {
      title: 'Test Blog No Token',
      author: 'Test Author No Token',
      url: 'http://testblognotoken.com',
      likes: 5,
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

// 4.13.
test('deleting a blog by ID', async () => {
  const newBlog = {
    title: 'Blog to Delete',
    author: 'Author to Delete',
    url: 'http://blogtodelete.com',
    likes: 5
  }
  // Create a new blog to be deleted
  const createdBlog = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
  // Get the ID of the created blog
  const blogId = createdBlog.body.id
  const initialBlogs = await helper.blogsInDb()
  // Delete the blog by ID
  await api
    .delete(`/api/blogs/${blogId}`)
    .set('Authorization', `Bearer ${token}`)
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

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

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

    expect(result.body.error).toContain('Username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

// 4.16.
describe('creating a user to login', () => {
  test('creating a new user with missing username returns 400 Bad Request', async () => {
    const newUser = {
      name: 'John Doe',
      password: 'secret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
      .expect(response => {
        expect(response.body.error).toContain('Both username and password are required')
      })
  })

  test('creating a new user with missing password returns 400 Bad Request', async () => {
    const newUser = {
      username: 'john_doe',
      name: 'John Doe',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
      .expect(response => {
        expect(response.body.error).toContain('Both username and password are required')
      })
  })

  test('creating a new user with short username returns 400 Bad Request', async () => {
    const newUser = {
      username: 'ab',
      name: 'John Doe',
      password: 'secret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
      .expect(response => {
        expect(response.body.error).toContain('Username and password must be at least 3 characters long')
      })
  })

  test('creating a new user with short password returns 400 Bad Request', async () => {
    const newUser = {
      username: 'john_doe',
      name: 'John Doe',
      password: 'ab',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
      .expect(response => {
        expect(response.body.error).toContain('Username and password must be at least 3 characters long')
      })
  })

  test('creating a new user with non-unique username returns 400 Bad Request', async () => {
    const existingUser = {
      username: 'root',
      name: 'Superuser',
      password: 'secret',
    }

    await api
      .post('/api/users')
      .send(existingUser)

    const duplicateUser = {
      username: 'root',
      name: 'Another User',
      password: 'anothersecret',
    }

    await api
      .post('/api/users')
      .send(duplicateUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
      .expect(response => {
        expect(response.body.error).toContain('Username must be unique')
      })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
