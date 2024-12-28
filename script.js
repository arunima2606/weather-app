const apiKey = 'bf8fa3827350056d761676b4b56d271d';
let unit = 'metric';

function getWeatherEmoji(description) {
    description = description.toLowerCase();
    if (description.includes("clear")) return "☀️";
    if (description.includes("cloud")) return "☁️";
    if (description.includes("rain")) return "🌧️";
    if (description.includes("drizzle")) return "🌦️";
    if (description.includes("thunderstorm")) return "⛈️";
    if (description.includes("snow")) return "❄️";
    if (description.includes("mist") || description.includes("fog")) return "🌫️";
    return "🌡️";
}

async function fetchWeather(useCurrentLocation = false) {
    const locationInput = document.getElementById('location');
    const currentWeatherOutput = document.getElementById('current-weather');
    const forecastOutput = document.getElementById('forecast');
    const loader = document.getElementById('loader');
    currentWeatherOutput.innerHTML = '';
    forecastOutput.innerHTML = '';
    loader.style.display = 'block';

    let location = locationInput.value;

    if (useCurrentLocation) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    location = `lat=${latitude}&lon=${longitude}`;
                    await getWeatherData(location);
                    loader.style.display = 'none';
                },
                (error) => {
                    currentWeatherOutput.innerHTML = `<p>Unable to fetch location: ${error.message}</p>`;
                    loader.style.display = 'none';
                }
            );
        } else {
            currentWeatherOutput.innerHTML = `<p>Geolocation not supported by this browser.</p>`;
            loader.style.display = 'none';
        }
    } else {
        if (!location.trim()) {
            currentWeatherOutput.innerHTML = `<p>Please enter a location.</p>`;
            loader.style.display = 'none';
            return;
        }
        await getWeatherData(`q=${location}`);
        loader.style.display = 'none';
    }
}

async function getWeatherData(location) {
    const currentWeatherOutput = document.getElementById('current-weather');
    const forecastOutput = document.getElementById('forecast');

    try {
        const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?${location}&appid=${apiKey}&units=${unit}`);
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${location}&appid=${apiKey}&units=${unit}`);
        
        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('API responded with an error.');
        }

        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        if (currentWeatherData.cod === 200) {
            const currentEmoji = getWeatherEmoji(currentWeatherData.weather[0].description);
            currentWeatherOutput.innerHTML = `
                <h3>Current Weather in ${currentWeatherData.name}</h3>
                <p>${currentEmoji} Temperature: ${currentWeatherData.main.temp}°${unit === 'metric' ? 'C' : 'F'}</p>
                <p>Condition: ${currentWeatherData.weather[0].description}</p>
                <p>Humidity: ${currentWeatherData.main.humidity}%</p>
                <p>Wind Speed: ${currentWeatherData.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
            `;

            forecastOutput.innerHTML = `<h3>5-Day Forecast</h3>`;
            if (!forecastData.list) {
                forecastOutput.innerHTML += `<p>No forecast data available.</p>`;
                return;
            }
            for (let i = 0; i < forecastData.list.length; i += 8) {
                const day = forecastData.list[i];
                const dayEmoji = getWeatherEmoji(day.weather[0].description);

                forecastOutput.innerHTML += `
                    <div class="forecast-item">
                        <p>${dayEmoji} Date: ${new Date(day.dt_txt).toDateString()}</p>
                        <p>Temp: ${day.main.temp}°${unit === 'metric' ? 'C' : 'F'}</p>
                        <p>Condition: ${day.weather[0].description}</p>
                    </div>
                `;
            }
        } else {
            currentWeatherOutput.innerHTML = `<p>Location not found. Please try again.</p>`;
        }
    } catch (error) {
        currentWeatherOutput.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
    }
}

function updateUnit() {
    unit = document.querySelector('input[name="unit"]:checked').value;
}
