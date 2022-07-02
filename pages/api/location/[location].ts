// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export type LocationRoute = {
  name: string;
  local_names?: {
    en: string;
    [key: string]: string;
  };
  lat: number;
  lon: number;
  country: string;
  state: string;
}[];

export const getLocation = async (location: string): Promise<LocationRoute> => {
  if (!process.env.API_KEY) throw new Error("No API key provided");

  const params = new URLSearchParams();

  params.append("appid", process.env.API_KEY);
  params.append("q", location);
  params.append("limit", "5");

  console.log("fetching location:" + location);

  const results = await fetch(
    "http://api.openweathermap.org/geo/1.0/direct?" + params
  );

  return await results.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationRoute | { message: string }>
) {
  try {
    res.setHeader(
      "Cache-Control",
      "public, max-age=100000000, s-maxage=100000000"
    );
    const { location } = req.query;

    if (typeof location !== "string")
      throw new Error("if you're seeing this, something went really wrong");

    const data = await getLocation(location);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}
