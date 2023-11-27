import React from 'react';
import Weather from './Weather'

const CountryDetail = ({ country }) => {
  const apiKey = import.meta.env.VITE_SOME_KEY
  console.log('Rendering CountryDetail component...');
  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>Capital: {country.capital}</p>
      <p>Area: {country.area.toLocaleString()} sq. km</p>
      <h3>Languages:</h3>
      <ul>
        {Object.values(country.languages).map((language, index) => (
          <li key={index}>{language}</li>
        ))}
      </ul>
      <img 
        src={country.flags.svg} 
        alt={`Flag of ${country.name.common}`}
        style={{ maxWidth: '200px', maxHeight: '150px' }}
         />
        <Weather capital={country.capital[0]} apiKey={apiKey} />
    </div>
  );
};

export default CountryDetail;