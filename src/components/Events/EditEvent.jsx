import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchEvent,
  queryClient,
  updateEvent,
} from "../../util/http-service.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  /**
   * Using getQueriesData here would render incorrect results if edit route is
   * refreshed or the route is modified for any path.
   *
   * Use useQuery instead since this edit dialog is opend above the details
   * page and should share the cached data of the details page
   */
  //
  //
  // const [[queryId, queryData]] = queryClient.getQueriesData({
  //   queryKey: ["events", id],
  // });

  /** Even when the loader is called for this route, instead of using useLoaderData
   * useQuery is kept around to use the cache and
   * other benefits that Tanstack query provides
   */
  const {
    data: queryData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 10000, //10 seconds, to use cache data without refetching within 10 seconds
  });

  // console.log("EditEvent : getQueriesData", queryId, queryData);

  const {
    mutate,
    isPending: isUpdatePending,
    isError: isUpdateError,
    error: updateError,
  } = useMutation({
    mutationFn: updateEvent,
    /** Optimistic update:
     * Immiediately update the UI data before the http UPDATE request is sent, and
     * rollback the old data if the update fails and show a prompt the user.
     *
     * onMutate is triggered before the mutationFn (or explicit mutate call),
     * Params passed to mutationFn are available in onMutate
     */
    onMutate: async (data) => {
      const newEvent = data.event;

      // Cancel any current outgoing queries for the id queryKey
      // current mutation won't be cancelled
      await queryClient.cancelQueries({ queryKey: ["events", id] });

      // get old data to rollback in case of update fails
      const oldEventData = queryClient.getQueryData(["events", id]);

      // Update cache, for optimistic data display
      queryClient.setQueryData(["events", id], newEvent);

      return { oldEventData };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.oldEventData);
    },
    // When mutation is done regardless of failed or succeded
    onSettled: () => {
      queryClient.invalidateQueries(["events", id]);
    },
    /** Alternative to invalidate query, onMutate() for optimistic update */
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["events", id] });
    //   handleClose();
    // },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    handleClose();
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {isPending && (
        <div className="center">
          <LoadingIndicator />
        </div>
      )}

      {!isPending && queryData && (
        <EventForm inputData={queryData} onSubmit={handleSubmit}>
          {isUpdatePending && "Updating..."}
          {!isUpdatePending && (
            <>
              {" "}
              <Link to="../" className="button-text">
                Cancel
              </Link>
              <button type="submit" className="button">
                Update
              </button>
            </>
          )}
        </EventForm>
      )}

      {isUpdateError ||
        (isError && (
          <>
            <ErrorBlock
              title={`Failed to ${isUpdateError ? "update" : "fetch"} event`}
              message={
                error?.info?.message ||
                updateError?.info?.message ||
                `Failed to ${
                  isUpdateError ? "update" : "fetch"
                } event. Please check your inputs and try again later.`
              }
            />
            <div className="form-actins">
              <Link to="../" className="button">
                Okay
              </Link>
            </div>
          </>
        ))}
    </Modal>
  );
}

export async function editEventLoader({ params }) {
  const id = params.id;

  /** Fetch data without the useQuery hook, using the QueryClient */
  return queryClient.fetchQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });
}
