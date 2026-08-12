import { useState, useEffect } from "react";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import { useUser } from "../../../context/UserContext.jsx";
import "./event-list.css";

export default function EventList() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch("/api/events", { credentials: "include" });
        if (!res.ok) {
          setError("Could not load events");
          return;
        }
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events", error);
        setError("Something went wrong");
      } finally {
        setLoading(false); //Runs whether we succeeded or failed
      }
    };
    loadEvents();
  }, []);

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
            to={`/member/events/${event._id}`}
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
    </Container>
  );
}
