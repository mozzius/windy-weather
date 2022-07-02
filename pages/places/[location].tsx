import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getWeather } from "../api/weather";

const Location: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ location }) => {
  return (
    <div>
      <h1>{location}</h1>
      <pre>{JSON.stringify(location, undefined, 2)}</pre>
      <pre>{JSON.stringify(location, undefined, 2)}</pre>
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

  const { location } = query;

  // aggressively cached
  const locRes = await fetch(
    `https://windy-weather.vercel.app/api/location/${location}`
  );
  const fullLocation = await locRes.json();

  if (fullLocation.length === 0) {
    return {
      props: {
        location: [],
        error: "Location not found",
      },
    };
  }

  // const weather = getWeather(fullLocation[0]);

  return { props: { location: fullLocation, error: null } };
};

export default Location;
