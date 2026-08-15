import { useState, useEffect } from "react";
import { Link } from "react-router";
import Container from "react-bootstrap/Container";
import Pager from "../../../components/widget/Pager.jsx";
import "./my-rsvps.css";

const PAGE_SIZE = 10;

function useRsvpSection(when) {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/events/mine?when=${when}&page=${page}&pageSize=${PAGE_SIZE}`,
          { credentials: "include" }
        );
        if (cancelled) return;
        if (!res.ok) {
          setError("Could not load your RSVPs");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setEvents(data.events);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to load RSVPs", err);
        if (!cancelled) setError("Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [when, page]);

  return { events, total, page, setPage, loading, error };
}

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

export default function MyRsvps() {
  const upcoming = useRsvpSection("upcoming");
  const past = useRsvpSection("past");

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
      {upcoming.error ? (
        <p className="text-attention">{upcoming.error}</p>
      ) : upcoming.loading ? (
        <p>Loading…</p>
      ) : upcoming.events.length === 0 ? (
        <p>You have no upcoming events you&apos;ve RSVP&apos;d to.</p>
      ) : (
        <>
          {upcoming.events.map(renderCard)}
          <Pager
            page={upcoming.page}
            pageSize={PAGE_SIZE}
            total={upcoming.total}
            onPageChange={upcoming.setPage}
          />
        </>
      )}

      <h2 className="sub-header-after-moto mt-4">Past</h2>
      <hr />
      {past.error ? (
        <p className="text-attention">{past.error}</p>
      ) : past.loading ? (
        <p>Loading…</p>
      ) : past.events.length === 0 ? (
        <p>You have no past events you&apos;ve RSVP&apos;d to.</p>
      ) : (
        <>
          {past.events.map(renderCard)}
          <Pager
            page={past.page}
            pageSize={PAGE_SIZE}
            total={past.total}
            onPageChange={past.setPage}
          />
        </>
      )}
    </Container>
  );
}
