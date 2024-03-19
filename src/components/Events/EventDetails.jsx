import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteEvent,
  fetchEvent,
  queryClient,
} from "../../util/http-service.js";
import ErrorBlock from "..//UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;

  console.log("EventDetails : params", params);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const {
    mutate,
    isLoading: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: () => deleteEvent({ id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["events"],
        // disable automatic refetching after invalidations
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  // console.log("EventDetails : useQuery fetch", {
  //   data,
  //   isLoading,
  //   isError,
  //   error,
  // });

  function handleDelete() {
    mutate(id);
  }

  function handleCloseModal() {
    setShowDeleteConfirmation(false);
  }

  return (
    <>
      {showDeleteConfirmation && (
        <Modal onClose={handleCloseModal}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>

          <div className="form-actions">
            {isDeleting && <p>Deleting...</p>}
            {!isDeleting && (
              <>
                <button className="button-text" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="button" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {(isLoading || isDeleting) && (
        <div id="event-details-content" className="center">
          <p>{isDeleting ? "Deleting" : "Loading"} event...</p>
        </div>
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
                    setShowDeleteConfirmation(true);
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
                <time dateTime={`Todo-DateT$Todo-Time`}>{`${new Date(
                  data.date
                ).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} @ ${data.time}`}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
