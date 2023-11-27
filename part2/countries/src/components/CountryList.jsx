// CountryList.js
import React, { useState, useEffect } from 'react'
import CountryDetail from './CountryDetail'

const CountryList = ({ countries, filter }) => {
  const [selectedCountry, setSelectedCountry] = useState(null)

  // Reset the selectedCountry when the filter changes
  useEffect(() => {
    setSelectedCountry(null)
  }, [filter])

  const showCountryDetail = (country) => {
    setSelectedCountry(country)
  }

  if (countries.length === 0) {
    return <p>No countries found</p>
  }

  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }

  if (selectedCountry) {
    return <CountryDetail country={selectedCountry} />
  }

  if (countries.length === 1) {
    return <CountryDetail country={countries[0]} />
  }

  return (
    <ul>
      {countries.map((country) => (
        <li key={country.cca3}>
          {country.name.common}
          <button onClick={() => showCountryDetail(country)}>Show</button>
        </li>
      ))}
    </ul>
  )
}

export default CountryList
