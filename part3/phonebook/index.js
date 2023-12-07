const express = require('express')
const app = express()
const morgan = require('morgan') // Import the Morgan middleware
require('dotenv').config()

app.use(express.json())
// 3.6. Define a new token for logging request body in JSON format. Use Morgan middleware with custom token for logging
morgan.token('postData', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))
// 3.9. Take the middleware to use and allow for requests from all origins
const cors = require('cors')
app.use(cors())
// 3.11. To make express show static content, the page index.html and the JavaScript, etc., it fetches
app.use(express.static('dist'))
// 3.13. MongoDB configuration in its own module. `Person` is the Mongoose model for the collection
const Person = require('./models/person')
// 3.15. Error Handling Middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const currentTime = new Date()
      const infoMessage = `<p>Phonebook has info for ${count} people</p><p>${currentTime}</p>`
      response.send(infoMessage)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() // 404 Not Found
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end() // 204 No Content
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' } //  On update operations, mongoose validators are off by default
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// Handler of malformatted id error
app.use(errorHandler)
// Handler of requests with unknown endpoint error
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})