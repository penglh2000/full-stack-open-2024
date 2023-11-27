import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ capital, apiKey }) => {
  // States
  const [weather, setWeather] = useState(null)

  // Effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching weather data in ${capital} from API...`)
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${apiKey}&units=metric`)
        console.log('Weather data fetched successfully:', response.data)
        setWeather(response.data)
      } catch (error) {
        console.error('Error fetching weather data:', error)
      }
    }

    if (apiKey && capital) {
      fetchData()
    }
  }, [apiKey, capital])

  console.log('Rendering Weather component...')
  return (
    <div>
       {/* Conditional Rendering: Render content only if 'weather' is truthy (not null or undefined) */}
      {weather && (
        <div>
          <h3>Weather in {capital}</h3>
          <p>Temperature: {weather.main.temp} ºC</p>
          <p>Description: {weather.weather[0].description} </p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather Icon"
            style={{ maxWidth: '200px', maxHeight: '150px' }}
          />
          <p>Wind: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  )
}

export default Weather
