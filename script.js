// api id: ddd0bd620778096839aab0479aa8ada8

const API_KEY = 'ddd0bd620778096839aab0479aa8ada8';
//CDMX 19.4285, -99.1277
//NY 40.71427, -74.00597
//LA 34.0522, -118.2436
let LATITUDE = 19.4285;
let LONGITUDE = -99.1277;
let timeZone = "America/Mexico_City";
let cityName = "Mexico City";

function getUserLocation () {
    return new Promise((resolve, reject) => {
        if("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    LATITUDE = position.coords.latitude;
                    LONGITUDE = position.coords.longitude;
                    resolve();
                },
                error => {
                    console.warn("Error getting location:", error.message);
                    resolve(); // Resolve anyway to use default location
                }
            );
        } else {
            console.warn("Geolocation is not supported by this browser.");
        }        
    })
};

async function getLocationInfo() {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        timeZone = data.timeZone;
        cityName = data.name;
        document.getElementById('city').textContent = cityName;
    } catch (error) {
        console.error('Error fetching location info:', error);
    }

}

function formatDate(date) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone };
    return date.toLocaleDateString('en-US', options);

    /*const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() +1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;*/
}

function formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone };
    return date.toLocaleTimeString('en-US', options)
    //return date.toLocaleTimeString('en-US', {hour12: false});
}

function updateClockAndDate() {
    const now = new Date();
    const timeString = formatTime(now);
    const dateString = formatDate(now);
    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

async function fetchSunTimes() {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        document.getElementById('sunrise').textContent = `Amanecer: ${formatTime(sunrise)}`;
        document.getElementById('sunset').textContent = `Anochecer: ${formatTime(sunset)}`;
        return { sunrise, sunset };
    } catch (error) {
        console.error('Error fetching sun times:', error);
    }
}

//
function updateBackground(sunrise, sunset) { 
    const now = new Date();
    const totalDayTime = sunset - sunrise;
    const timeSinceSunrise = now - sunrise;
    const progress = Math.min(Math.max(timeSinceSunrise /totalDayTime, 0), 1);

    // Calculate gradient angle 
    const angle = 45 + (progress * 270);

    // Calculate colors
    const startColor = interpolateColor([255, 192, 203], [255, 165, 0], progress); // Pink to Orange
    const endColor = interpolateColor([0, 0, 139], [25, 25, 112], progress); // Dark Blue to midnight blue

    const opacity = 1 - (Math.sin(progress * Math.PI) * 0.8 + 0.2);
    const gradientOverlay = document.querySelector('.gradient-overlay');
    gradientOverlay.style.background = `linear-gradient(${angle}deg, rgba(${startColor.join(',')}, ${opacity}) 0%, rgba(${endColor.join(',')}, ${opacity}) 100%)`;
}

function interpolateColor(color1, color2, factor) {
    return color1.map((channel, index) => {
        return Math.round(channel + factor * (color2[index] - channel));
    });
}

async function initSunDial() {
    await getUserLocation();
    await getLocationInfo();
    const sunTimes = await fetchSunTimes();
    if (sunTimes) {
        setInterval(() => {
            updateClockAndDate();
            updateBackground(sunTimes.sunrise, sunTimes.sunset);
        }, 1000);
    }
}


initSunDial();
//updateClockAndDate();
//fetchSunTimes();