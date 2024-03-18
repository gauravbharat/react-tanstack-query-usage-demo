import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { useQuery } from "@tanstack/react-query";

import { fetchEvents } from "../../util/http-service.js";

export default function NewEventsSection() {
  // Important!!!: Note that, by default, useQuery would trigger a refetch each time
  // this component gets focus
  // It would use the cached data first and query http again to fetch updated data and
  // replace the cache
  const {
    data,
    isPending: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", { max: 3 }],
    // queryKey is accessible in the Query Function (queryFn) as a param
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    staleTime: 5000, //time to wait till http request is fetched again when page is revisited
    // gcTime: 30000, //clear cache (garbage collect) data after gcTime is over
  });

  let content;

  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error?.info?.message || "Failed to fetch events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
