// Search filter component
const Filter = ({ filter, handleFilterChange }) => (
    <div>
      Find countries <input value={filter} onChange={handleFilterChange} />
    </div>
  )

  export default Filter