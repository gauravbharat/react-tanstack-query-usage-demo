import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteEvent,
  fetchEvent,
  queryClient,
} from "../../util/http-service.js";
import ErrorBlock from "..//UI/ErrorBlock.jsx";

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;

  console.log("EventDetails : params", params);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [{ id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const {
    mutate,
    isLoading: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: () => deleteEvent({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
  });

  // console.log("EventDetails : useQuery fetch", {
  //   data,
  //   isLoading,
  //   isError,
  //   error,
  // });

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {(isLoading || isDeleting) && (
        <p style={{ textAlign: "center" }}>Loading event...</p>
      )}
      {(isError || isDeleteError) && (
        <ErrorBlock
          title={`Error ${isDeleteError ? "deleting" : "fetching"} event`}
          message={
            error?.info?.message ||
            deleteError?.info?.message ||
            "Please try again after some time"
          }
        />
      )}

      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            {isDeleting && <p>Deleting...</p>}
            {!isDeleting && (
              <nav>
                <button
                  onClick={() => {
                    mutate(id);
                  }}
                >
                  Delete
                </button>
                <Link to="edit">Edit</Link>
              </nav>
            )}
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time
                  dateTime={`Todo-DateT$Todo-Time`}
                >{`${data.date} @ ${data.time}`}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
