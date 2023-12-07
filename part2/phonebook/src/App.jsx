import { useState, useEffect } from 'react'
//Services
import personService from './services/persons'
//Components
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import Filter from './components/Filter'
import Notification from './components/Notification'

const App = () => {
  // State to track the persons
  const [persons, setPersons] = useState([])
  // State to track the value of the input field for adding a new name
  const [newName, setNewName] = useState('')
  // State to track the value of the input field for adding a new phone number
  const [newNumber, setNewNumber] = useState('')
  // State to track the filter of people by name
  const [filter, setFilter] = useState('')
  //State to track the error notification
  const [notification, setNotification] = useState({ message: null, type: null })


  // Handler function for changes in the name input field
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
  // Handler function for changes in the phone number input field
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
  // Handler function for changes in the filter input field
  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }
  // Handler function for submitting the form to add a new person
  const addPerson = (event) => {
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      // Person already exists, update phone number
      const confirmUpdate = window.confirm(`${newName} is already added to the phonebook. Replace the old number with a new one?`)
      if (!confirmUpdate) {
        console.log('Update canceled.')
        return
      }
      const updatedPerson = { ...existingPerson, number: newNumber }
      console.log('Updating person:', updatedPerson)
      personService
        .update(existingPerson.id, updatedPerson)
        .then(returnedPerson => {
          console.log('Person updated successfully:', returnedPerson)
          setPersons(persons.map(person =>
            person.id !== existingPerson.id ? person : returnedPerson
          ))
          setNewName('')
          setNewNumber('')
          setNotification({ message: `Phone number for '${returnedPerson.name}' updated successfully!`, type: 'success' })
          setTimeout(() => {
            setNotification({ message: null, type: null })
          }, 5000)
        })
        .catch(error => {
          console.error('Error updating person:', error)
          setNotification({ message: `Error updating phone number for '${existingPerson.name}'`, type: 'error' })
          setTimeout(() => {
            setNotification({message: null, type: null})
          }, 5000)
        })
    } else {
      // Person does not exist, add a new person
      const personObject = {
        name: newName,
        number: newNumber,
      }
      console.log('Creating new person:', personObject)
      personService
        .create(personObject)
        .then(returnedPerson => {
          console.log('Person created successfully:', returnedPerson)
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setNotification({ message: `Added '${returnedPerson.name}' to the phonebook!`, type:'success' })
          setTimeout(() => {
            setNotification({ message: null, type: null })
          }, 5000)
        })
        .catch(error => {
          console.error('Error creating person:', error.response.data.error)
          setNotification({ message: error.response.data.error, type: 'error' })
          setTimeout(() => {
            setNotification({ message: null, type: null })
          }, 5000)
        })
    }
  }
  // Handler function for deleting a person
  const handleDelete = (id) => {
    const personToDelete = persons.find(person => person.id === id)
    const confirmDeletion = window.confirm(`Delete ${personToDelete.name}?`)
    if (confirmDeletion) {
      console.log('Deleting person:', personToDelete)
      personService
        .remove(id)
        .then(() => {
          console.log('Person deleted successfully.')
          setPersons(persons.filter(person => person.id !== id))
          setNotification({ message: `Information of ${personToDelete.name} removed from server successfully!`, type: 'error' })
          setTimeout(() => {
            setNotification({ message: null, type: null })
          }, 5000)
        })
        .catch(error => {
          console.error('Error deleting person:', error)
          setNotification({ message: `Information of ${personToDelete.name} has already been removed from server`, type: 'error' })
          setTimeout(() => {
            setNotification({ message: null, type: null })
          }, 5000)
        })
    }
  }


  // Filtered persons based on the filter
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )


  // Fetch initial data from the server
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, []) // The empty dependency array ensures that this effect runs only once

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type}/>
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h3>Numbers</h3>
      <Persons filteredPersons={filteredPersons} handleDelete={handleDelete} />
    </div>
  )
}

export default App