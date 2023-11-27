import { useState, useEffect } from 'react'
import axios from 'axios'
//Components
import Filter from './components/Filter'
import CountryList from './components/CountryList'


const App = () => {
  // State to track the filter of countries by name
  const [filter, setFilter] = useState('')
  // State to track the countries
  const [countries, setCountries] = useState([])

  // Handler function for changes in the filter input field
  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  // Filtered countries based on the filter
  const filteredCountries = countries.filter(country =>
    country.name.common.toLowerCase().includes(filter.toLowerCase())
  )

  // Fetch initial data from the server
  useEffect(() => {
    console.log('Fetching countries data from API...');
    axios
      .get("https://studies.cs.helsinki.fi/restcountries/api/all")
      .then((response) => {
        console.log('Countries data fetched successfully:', response.data)
        setCountries(response.data);
      })
      .catch(error => {
        console.error('Error fetching countries data:', error)
      })
  }, []);

  return (
    <div>
      <h1>Data for Countries</h1>
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <CountryList countries={filteredCountries} filter={filter} />
    </div>
  )
}

export default App