const express = require('express')
const morgan = require('morgan'); // Import the Morgan middleware
const app = express()

app.use(express.json())

// 3.5. Use Morgan middleware for logging
// app.use(morgan('tiny'))
// 3.6.Define a new token for logging request body in JSON format. Use Morgan middleware with custom token for logging
morgan.token('postData', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));

// Take the middleware to use and allow for requests from all origins
const cors = require('cors')
app.use(cors())

// To make express show static content, the page index.html and the JavaScript, etc., it fetches
app.use(express.static('dist'))

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(p => p.id))
    : 0
  return maxId + 1
}

app.get('/', (request, response) => {
  response.send('<h1>Phonebook backend</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const currentTime = new Date()
  const infoMessage = `<p>Phonebook has info for ${persons.length} people</p><p>${currentTime}</p>`
  response.send(infoMessage)
})

app.get('/api/persons/:id', (request, response) => {
  const id = parseInt(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).send('Not Found') // 404 Not Found
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = parseInt(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end() // 204 No Content
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  //Check if the name or number is missing
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  // Check if the name already exists in the phonebook
  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})

// const PORT = 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})