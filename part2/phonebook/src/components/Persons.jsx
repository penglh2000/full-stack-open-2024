// Persons component
const Persons = ({ filteredPersons, handleDelete }) => (
  <ul>
    {filteredPersons.map(person => (
      <li key={person.id}>
        {person.name} {person.number}
        <button onClick={() => handleDelete(person.id)}>Delete</button>
      </li>
    ))}
  </ul>
)

export default Persons