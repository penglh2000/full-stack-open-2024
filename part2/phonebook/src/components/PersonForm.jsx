// PersonForm component (for adding new people to the phonebook)
const PersonForm = ({ newName, newNumber, handleNameChange, handleNumberChange, addPerson }) => (
    <form onSubmit={addPerson}>
      <div>
        Name: <input value={newName} onChange={handleNameChange}/>
      </div>
      <div>
        Number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">Add</button>
      </div>
    </form>
  )

  export default PersonForm