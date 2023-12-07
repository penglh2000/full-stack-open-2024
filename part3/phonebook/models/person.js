const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('Connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'Contact name required!']
  },
  number: {
    type: String,
    validate: {
      validator: function (value) {
        // Custom validation function
        const phoneNumberRegex = /^(\d{2,3})-(\d+)$/; // Regex for the phone number format
        // Check if the value matches the phone number format
        return phoneNumberRegex.test(value);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'Contact phone number required!']
  }
})

// One way to format the objects returned by Mongoose is to modify the toJSON method of the schema
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)