import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Container from "react-bootstrap/Container";
import { Button } from "react-bootstrap";
import { useUser } from "../../../context/UserContext.jsx";
import RSVPButton from "../rsvp-button/RSVPButton.jsx";
import WarningIcon from "../../../components/icons/WarningIcon.jsx";
import "./event-detail.css";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
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

        // If the user is an admin then load who is attending as well
        if (user && user.role === "admin") {
          const rsvpRes = await fetch(`/api/events/${id}/rsvps`, {
            credentials: "include",
          });
          if (rsvpRes.ok) setAttendees(await rsvpRes.json());
        }
      } catch (err) {
        console.error("failer to load event", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id, user]); // re-run if the URL id or the user changes

  const handleCancel = async () => {
    if (!window.confirm("Cancel this event? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setError("Could not cancel the event");
        return;
      }
      navigate("/member/events"); // event is gone → go back to the list
    } catch (err) {
      console.error("Cancel event failed", err);
      setError("Something went wrong");
    }
  };

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
        content="Landing page for an event created by an admin of the club. This page lists all the details regarding an event, 
        and allows members to RSVP if they have the correct tier of dues. If the user is an admin, 
        they can cancel or edit the event and view all the particpents going."
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
        <p>Required tier: {event.requiredTier}</p>

        <RSVPButton
          eventId={event._id}
          initialGoing={!!(user && event.rsvps?.includes(user.id))}
        />

        {user && user.role === "admin" && (
          <div className="mt-3">
            <Link
              to={`/admin/events/${event._id}/edit`}
              className="btn btn-action-secondary me-2"
            >
              Edit
            </Link>
            <Button
              variant={null}
              className="btn-action-danger"
              onClick={handleCancel}
            >
              <WarningIcon />
              Cancel Event
            </Button>
          </div>
        )}
      </div>

      {user && user.role === "admin" && (
        <div className="attendee-list mt-4">
          <h3>RSVPs ({attendees.length})</h3>
          {attendees.length === 0 && <p>No RSVPs yet</p>}
          {attendees.map((a) => (
            <p key={a.id}>
              {a.firstName} {a.lastName} - {a.email}
              {(a.duesTier == "gold" || a.duesTier == "silver") && (
                <span className={`status-badge ${a.duesTier} ms-2`}>{a.duesTier}</span>
              )}
            </p>
          ))}
        </div>
      )}
    </Container>
  );
}
