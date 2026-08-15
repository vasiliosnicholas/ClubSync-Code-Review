import { useState, useEffect } from "react";
import { useParams } from "react-router";
import Container from "react-bootstrap/Container";
import { useUser } from "../../../context/UserContext.jsx";
import RSVPButton from "../rsvp-button/RSVPButton.jsx";
import TierInfo from "../../../components/widget/TierInfo.jsx";
import "./event-detail.css";

// this page is intentionally the same for every role: event info, how many
// people are attending, and the RSVP action. Admin-only concerns (the full
// attendee list, edit, cancel) live on the separate admin event detail page.
export default function EventDetail() {
  const { id } = useParams();
  const { user } = useUser();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setError("Could not load this event");
          return;
        }
        setEvent(await res.json());
      } catch (err) {
        console.error("failer to load event", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <Container className="px-5">
        <title>Event · ClubSync</title>
        <p>Loading</p>
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="px-5">
        <title>Event · ClubSync</title>
        <p className="text-attention">{error}</p>
      </Container>
    );
  }
  if (!event) return null;

  return (
    <Container className="px-5">
      <title>{`${event.name} · ClubSync`}</title>
      <meta
        name="description"
        content="Landing page for an event created by an admin of the club. This page lists all the details regarding an event
        and lets members RSVP (or cancel their RSVP) if they have the correct tier of dues, and see how many people are attending."
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <div className="event-detail-card">
        <h1>{event.name}</h1>
        <p>
          {event.type} · {event.location}
        </p>
        <p>
          Date:{" "}
          {new Date(event.date).toLocaleDateString(undefined, {
            timeZone: "UTC",
          })}
        </p>
        <p>
          Required tier: {event.requiredTier}
          <TierInfo text="You need approved dues at this tier or higher to RSVP. Gold outranks Silver, and “None” events are open to everyone." />
        </p>
        <p>{event.rsvps?.length ?? 0} people attending</p>

        <RSVPButton
          eventId={event._id}
          initialGoing={!!(user && event.rsvps?.includes(user.id))}
        />
      </div>
    </Container>
  );
}
