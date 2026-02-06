export function WeatherCard({ city, temperature, condition, humidity, wind }) {
  return (
    <div style={{
      padding: "20px",
      borderRadius: "12px",
      background: "#1e293b",
      color: "white",
      marginTop: "10px"
    }}>
      <h2>🌍 {city}</h2>
      <h1>{temperature}</h1>
      <p>{condition}</p>
      <p>💧 Humidity: {humidity}</p>
      <p>🌬 Wind: {wind}</p>
    </div>
  );
}
