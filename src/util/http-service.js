export async function fetchEvents({ signal, searchTerm }) {
  let url = "http://localhost:3000/events";

  if (searchTerm) {
    url = `${url}?search=${searchTerm}`;
  }

  // if the user navigates away from the component, useQuery aborts the request
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}
