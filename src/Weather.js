import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import { Oval } from 'react-loader-spinner';
import backgroundImageSunny from './assets/images/Sunny.jpg';
import backgroundImageRainy from './assets/images/Rainy.jpg';
import backgroundImage from './assets/images/background.jpg';
import './Weather.css';

function WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [forecast, setForecast] = useState({
    loading: false,
    data: [],
    error: false,
  });

  const toDateFunction = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const WeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
    const currentDate = new Date();
    const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput('');
      setWeather({ ...weather, loading: true });
      setForecast({ ...forecast, loading: true });

      const url = 'https://api.openweathermap.org/data/2.5/weather';
      const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
      const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

      try {
        const [weatherResponse, forecastResponse] = await Promise.all([
          axios.get(url, { params: { q: input, units: 'metric', appid: api_key } }),
          axios.get(forecastUrl, { params: { q: input, units: 'metric', appid: api_key } }),
        ]);

        setWeather({ data: weatherResponse.data, loading: false, error: false });
        setForecast({ data: forecastResponse.data.list, loading: false, error: false });
      } catch (error) {
        setWeather({ ...weather, data: {}, error: true });
        setForecast({ ...forecast, data: [], error: true });
        setInput('');
        console.error('Error:', error);
      }
    }
  };

  const getBackgroundImage = () => {
    if (weather.data && weather.data.weather && weather.data.weather[0]) {
      const weatherType = weather.data.weather[0].main.toLowerCase();
      switch (weatherType) {
        case 'clear':
          return `url(${backgroundImageSunny})`;
        case 'rain':
          return `url(${backgroundImageRainy})`;
        default:
          return `url(${backgroundImage})`;
      }
    }
    return `url(${backgroundImageSunny})`;
  };

  const getWeatherIcon = () => {
    if (weather.data && weather.data.weather && weather.data.weather[0]) {
      return `https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`;
    }
    // Default icon if no weather data is available
    return 'default-icon-url'; // Replace with the URL of your default icon
  };

  const renderForecastCards = () => {
    if (forecast.data.length === 0) {
      return null;
    }

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    const uniqueDates = new Set();

    const forecastItems = forecast.data
      .filter((item) => {
        const itemDate = new Date(item.dt * 1000);
        const dateString = itemDate.toDateString(); // Convert to a string for comparison

        if (itemDate > currentDate && !uniqueDates.has(dateString)) {
          uniqueDates.add(dateString);
          return true;
        }

        return false;
      })
      .map((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const temp = Math.round(item.main.temp);

        return (
          <div key={item.dt} className="forecast-card">
            <p>{day}</p>
            <p>{dateString}</p>
            <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
              alt={item.weather[0].description}
            />
            <p>{temp}°C</p>
          </div>
        );
      });

    return <div className="forecast-container">{forecastItems}</div>;
  };

  return (
    <div className="App" style={{ backgroundImage: getBackgroundImage() }}>
      <h1 className="app-name">Weather App</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Enter City Name.."
          name="query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
      </div>
      {weather.loading && (
        <>
          <br />
          <br />
          <Oval type="Oval" color="black" height={100} width={100} />
        </>
      )}
      {weather.error && (
        <>
          <br />
          <br />
          <span className="error-message">
            <FontAwesomeIcon icon={faFrown} />
            <span style={{ fontSize: '20px' }}>City not found</span>
          </span>
        </>
      )}
      {weather && weather.data && weather.data.main && (
        <div>
          <div className="city-name">
            <h2>
              {weather.data.name}, <span>{weather.data.sys.country}</span>
            </h2>
          </div>
          <div className="date">
            <span>{toDateFunction()}</span>
          </div>
          <div className="icon-temp">
            <img
              className=""
              src={getWeatherIcon()}
              alt={weather.data.weather[0].description}
            />
            {Math.round(weather.data.main.temp)}
            <sup className="deg">°C</sup>
          </div>
          <div className="des-wind">
            <p>{weather.data.weather[0].description.toUpperCase()}</p>
            <p>Wind Speed: {weather.data.wind.speed}m/s</p>
          </div>
        </div>
      )}
      {renderForecastCards()}
    </div>
  );
}

export default WeatherApp;
