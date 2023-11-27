// Search filter component
const Filter = ({ filter, handleFilterChange }) => (
    <div>
      Filter shown with <input value={filter} onChange={handleFilterChange} />
    </div>
  )

  export default Filter