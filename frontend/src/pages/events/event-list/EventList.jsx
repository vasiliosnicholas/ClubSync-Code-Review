import { useState, useEffect } from "react";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import PropTypes from "prop-types";
import { useUser } from "../../../context/UserContext.jsx";
import Pager from "../../../components/widget/Pager.jsx";
import "./event-list.css";

const PAGE_SIZE = 15;

// basePath lets each caller decide where a click leads. the member browse
// page always links to the RSVP-focused detail view, while admin event
// management links to the admin-only detail view (RSVPs, edit, cancel).
export default function EventList({ basePath = "/member/events" }) {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/events?page=${page}&pageSize=${PAGE_SIZE}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          setError("Could not load events");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setEvents(data.events);
        setTotal(data.total);
      } catch (error) {
        console.error("Failed to load events", error);
        setError("Something went wrong");
      } finally {
        if (!cancelled) setLoading(false); //Runs whether we succeeded or failed
      }
    };
    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // If it is still loading so some sign
  if (loading) {
    return (
      <Container className="px-5">
        <p>Loading events…</p>
      </Container>
    );
  }

  // If there is an error then show the error
  if (error) {
    return (
      <Container className="px-5">
        <p className="text-attention">{error}</p>
      </Container>
    );
  }

  // Once there is a successful load then show the list
  return (
    <Container className="px-5">
      <h1 className="moto">Events</h1>

      {/* empty-state message when there are no events */}
      {events.length === 0 && (
        <p className="spacing-after-moto">No events yet.</p>
      )}

      {/* turn each event object into a card; key must be unique + stable */}
      {events.map((event) => {
        // is the logged-in member already RSVP'd to this event?
        const going = user && event.rsvps?.includes(user.id);
        return (
          <Link
            key={event._id}
            to={`${basePath}/${event._id}`}
            className="event-card-link"
          >
            <div className={`event-card${going ? " event-card-going" : ""}`}>
              <div className="event-card-header">
                <h3>{event.name}</h3>
                {going && <span className="event-going-badge">✓ Going</span>}
              </div>
              <p>
                {event.type} · {event.location}
              </p>
              <p>Required tier: {event.requiredTier}</p>
            </div>
          </Link>
        );
      })}

      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </Container>
  );
}

EventList.propTypes = {
  basePath: PropTypes.string,
};
