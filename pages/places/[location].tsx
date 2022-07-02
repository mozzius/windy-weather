import { format } from "date-fns";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import type { LocationRoute } from "../api/location/[location]";
import { getWeather } from "../api/weather";

const Location: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ locations, weather, error }) => {
  if (error || !weather || !locations) {
    return <p>Error: {error}</p>;
  }

  const location = locations[0]

  console.log(location)

  return (
    <div>
      <h1>{location.local_names?.en ?? location.name }</h1>
      {weather.list.map((item) => (
        <div key={item.dt}>
          <p>{format(new Date(item.dt_txt), "dd/MM/yyyy HH:MM")}</p>
          <p>{item.main.temp}°C</p>
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps = async ({
  res,
  query,
}: GetServerSidePropsContext) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=600"
  );

  const { location: locationQuery } = query;

  // aggressively cached
  const locRes = await fetch(
    `${
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://windy-weather.vercel.app"
    }/api/location/${locationQuery}`
  );
  const locations: LocationRoute = await locRes.json();

  if (locations.length === 0) {
    return {
      props: {
        error: "Location not found",
        locations: null,
        weather: null,
      },
    };
  }

  const { lat, lon } = locations[0];

  const weather = await getWeather(lat, lon);

  return { props: { locations, weather, error: null } };
};

export default Location;
