import type { NextApiRequest, NextApiResponse } from "next";

type WeatherRoute = any;

export const getWeather = async (location: string, units?: string) => {
  if (!process.env.API_KEY) throw new Error("No API key provided");

  const isInvalidUnit = !["standard", "metric", "imperial", undefined].includes(
    units
  );

  if (isInvalidUnit) throw new Error("Invalid unit provided");

  const params = new URLSearchParams();

  params.append("appid", process.env.API_KEY);
  params.append("q", location);
  if (units) params.append("units", units);

  const results = await fetch(
    "https://api.openweathermap.org/data/2.5/weather?" + params
  );

  return await results.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherRoute | { message: string }>
) {
  try {
    const { location, units } = req.query;

    if (!location || typeof location !== "string")
      throw new Error("No location provided");

    if (typeof units === "object") throw new Error("Multiple units provided");

    const data = getWeather(location, units);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}
