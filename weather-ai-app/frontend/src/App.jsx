import { useState } from "react";

function WeatherCard({ weather }) {
  if (!weather) return null;
  return (
    <div style={{
      padding: 20,
      borderRadius: 12,
      background: "#1e293b",
      color: "white",
      width: 250,
      marginTop: 20
    }}>
      <h2>{weather.city}</h2>
      <h1>{weather.temperature}</h1>
      <p>{weather.condition}</p>
      <p>Humidity: {weather.humidity}</p>
      <p>Wind: {weather.wind}</p>
    </div>
  );
}

function WeatherMain() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const response = await fetch(
        `https://solid-sniffle-9qxq66jv442xq59-8000.app.github.dev/weather?city=${encodeURIComponent(city)}`
      );
      if (!response.ok) throw new Error("City not found or API error");
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Weather App</h1>
      <form onSubmit={fetchWeather} style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Enter city name"
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginRight: 8 }}
        />
        <button type="submit" style={{ padding: 8, borderRadius: 4, background: '#1e293b', color: 'white', border: 'none' }}>
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <WeatherCard weather={weather} />
    </div>
  );
}

function App() {
  return <WeatherMain />;
}

export default App;