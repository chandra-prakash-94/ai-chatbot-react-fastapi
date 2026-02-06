import { useFrontendTool } from "@copilotkit/react-core";
import { z } from "zod";
import axios from "axios";
import { WeatherCard } from "./WeatherCard";

export function WeatherTool() {
  useFrontendTool({
    name: "get_weather_tool",   // must match backend tool name
    description: "Get current weather for a city",

    parameters: z.object({
      city: z.string(),
    }),

    handler: async ({ city }) => {
      const res = await axios.get(
        `https://solid-sniffle-9qx66jv442xq59-8000.app.github.dev/weather?city=${city}`
      );
      return JSON.stringify(res.data);
    },

    render: ({ status, result }) => {
      if (status === "executing") return <p>🌦 Fetching weather...</p>;

      if (status === "complete" && result) {
        const data = JSON.parse(result);
        return <WeatherCard {...data} />;
      }

      return null;
    },
  });

  return null;
}
