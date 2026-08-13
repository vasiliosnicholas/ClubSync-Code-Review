import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Container from "react-bootstrap/Container";
import { Button, Row } from "react-bootstrap";
import WarningIcon from "../../../../components/icons/WarningIcon.jsx";
import WidgetCard from "../../../../components/widget/WidgetCard.jsx";
import PreviewList from "../../../../components/widget/PreviewList.jsx";
import CancelEventModal from "./CancelEventModal.jsx";
import "../../../events/event-detail/event-detail.css";

const ATTENDEE_COLUMNS = [
  { label: "Name", size: 3, render: (a) => `${a.firstName} ${a.lastName}` },
  { label: "Email", size: 3, render: (a) => a.email },
  { label: "Phone Number", size: 3, render: (a) => a.phoneNumber },
  {
    label: "DOB",
    size: 2,
    render: (a) =>
      new Date(a.birthDate).toLocaleDateString(undefined, { timeZone: "UTC" }),
  },
  {
    label: "Tier",
    size: 1,
    render: (a) =>
      a.duesTier === "gold" || a.duesTier === "silver" ? (
        <span className={`status-badge ${a.duesTier}`}>{a.duesTier}</span>
      ) : null,
  },
];

// admin-only event view: who's attending, edit, cancel. No RSVP button here —
// RSVPing is a member action that only happens on the member event page.
export default function AdminEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

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

        const rsvpRes = await fetch(`/api/events/${id}/rsvps`, {
          credentials: "include",
        });
        if (rsvpRes.ok) setAttendees(await rsvpRes.json());
      } catch (err) {
        console.error("Failed to load event", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setCancelError("Could not cancel the event");
        return;
      }
      navigate("/admin/event-management");
    } catch (err) {
      console.error("Cancel event failed", err);
      setCancelError("Something went wrong");
    } finally {
      setCancelling(false);
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
        content="Admin-only event management page. Shows who has RSVP'd to an event and
        lets an admin edit the event's details or cancel it entirely."
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
            onClick={() => setShowCancel(true)}
          >
            <WarningIcon />
            Cancel Event
          </Button>
        </div>
      </div>

      <Row className="justify-content-center gy-4 mt-4">
        <WidgetCard
          title={`RSVPs (${attendees.length})`}
          subtitle="Who's attending"
        >
          <PreviewList
            columns={ATTENDEE_COLUMNS}
            items={attendees}
            total={attendees.length}
            emptyMessage="No RSVPs yet"
            rowKey={(a) => a.id}
          />
        </WidgetCard>
      </Row>

      <CancelEventModal
        show={showCancel}
        eventName={event.name}
        submitting={cancelling}
        error={cancelError}
        onHide={() => !cancelling && setShowCancel(false)}
        onConfirm={handleCancel}
      />
    </Container>
  );
}
