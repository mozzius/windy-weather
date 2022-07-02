import type { NextApiRequest, NextApiResponse } from "next";

type WeatherRoute = {
  cod: string;
  message: number;
  cnt: number;
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
    };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
};

export const getWeather = async (
  lat: number | string,
  lon: number | string,
  units: string = "metric"
): Promise<WeatherRoute> => {
  if (!process.env.API_KEY) throw new Error("No API key provided");

  const isInvalidUnit = !["standard", "metric", "imperial"].includes(units);

  if (isInvalidUnit) throw new Error("Invalid unit provided");

  const params = new URLSearchParams();

  params.append("appid", process.env.API_KEY);
  params.append("lat", String(lat));
  params.append("lon", String(lon));
  params.append("units", units);

  const results = await fetch(
    "https://api.openweathermap.org/data/2.5/forecast?" + params
  );

  return await results.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherRoute | { message: string }>
) {
  try {
    const { lat, lon, units } = req.query;

    if (typeof lat !== "string" || typeof lon !== "string")
      throw new Error("No location provided");

    if (typeof units === "object") throw new Error("Multiple units provided");

    const data = await getWeather(lat, lon, units);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}
