import "./styles.css";

const WeatherComponent = (props: { city: string }) => {
  return <div className="bg-red-500 p-4 rounded">Weather for {props.city}</div>;
};

export default {
  weather: WeatherComponent,
};
