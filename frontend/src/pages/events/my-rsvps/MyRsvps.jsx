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

  // split by date using the UTC date portion (matches how dates are displayed).
  // upcoming = today or later (soonest first); past = before today (newest first).
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => (e.date || "").slice(0, 10) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = events
    .filter((e) => (e.date || "").slice(0, 10) < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const renderCard = (event) => (
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
  );

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

      <h2 className="sub-header-after-moto">Upcoming</h2>
      <hr />
      {upcoming.length === 0 ? (
        <p>You have no upcoming events you&apos;ve RSVP&apos;d to.</p>
      ) : (
        upcoming.map(renderCard)
      )}

      <h2 className="sub-header-after-moto mt-4">Past</h2>
      <hr />
      {past.length === 0 ? (
        <p>You have no past events you&apos;ve RSVP&apos;d to.</p>
      ) : (
        past.map(renderCard)
      )}
    </Container>
  );
}
