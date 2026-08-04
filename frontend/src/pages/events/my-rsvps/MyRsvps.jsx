import { useState, useEffect } from "react";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import "./my-rsvps.css";

export default function MyRsvps() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyRsvps = async () => {
      try {
        const res = await fetch("/api/events/mine", {
          credentials: "include",
        });
        if (!res.ok) {
          setError("Could not load your RSVPs");
          return;
        }
        setEvents(await res.json());
      } catch (err) {
        console.error("Failed to load RSVPs", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadMyRsvps();
  }, []);

  if (loading) {
    return (
      <Container className="px-5">
        <title>My RSVPs · ClubSync</title>
        <p>Loading…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="px-5">
        <title>My RSVPs · ClubSync</title>
        <p className="text-attention">{error}</p>
      </Container>
    );
  }

  return (
    <Container className="px-5">
      <title>My RSVPs · ClubSync</title>
      <meta
        name="description"
        content="Member page that will display all the RSVP's for this user. 
        This means every event that the user has pressed the RSVP button for will show up on this page"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <h1 className="moto">My RSVPs</h1>

      {events.length === 0 && (
        <p className="spacing-after-moto">
          You haven&apos;t RSVP&apos;d to any events yet.
        </p>
      )}

      {events.map((event) => (
        <Link
          key={event._id}
          to={`/member/events/${event._id}`}
          className="event-card-link"
        >
          <div className="event-card">
            <h3>{event.name}</h3>
            <p>
              {event.type} · {event.location}
            </p>
            <p>
              Date:{" "}
              {new Date(event.date).toLocaleDateString(undefined, {
                timeZone: "UTC",
              })}
            </p>
          </div>
        </Link>
      ))}
    </Container>
  );
}
