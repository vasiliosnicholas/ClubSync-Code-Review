import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./event-edit.css";

export default function EventEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // same fields as EventForm — but we PRE-FILL them from the existing event
  const [name, setName] = useState("");
  const [type, setType] = useState("social");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [requiredTier, setRequiredTier] = useState("none");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // load the event once, then seed each state value with its current value
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
        const event = await res.json();
        setName(event.name);
        setType(event.type);
        // a date input needs "YYYY-MM-DD"; the API returns a full ISO string
        setDate(event.date ? event.date.slice(0, 10) : "");
        setLocation(event.location);
        setRequiredTier(event.requiredTier);
      } catch (err) {
        console.error("Failed to load event", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, type, date, location, requiredTier }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not save changes");
        return;
      }
      // saved — go back to this event's detail page
      navigate(`/member/events/${id}`);
    } catch (err) {
      console.error("Update event failed", err);
      setError("Something went wrong");
    }
  };

  if (loading) {
    return (
      <Container className="px-5">
        <title>Edit Event · ClubSync</title>
        <p>Loading…</p>
      </Container>
    );
  }

  return (
    <Container className="px-5">
      <title>Edit Event · ClubSync</title>
      <meta
        name="description"
        content="Admin only page where admins can edit an existing event created in the club. 
        It does not have to be the same admin that created an event, as long as they have admin status you can edit the event"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <div className="event-edit">
        <h2>Edit Event</h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Event name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="practice">Practice</option>
              <option value="social">Social</option>
              <option value="meeting">Meeting</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Required tier</Form.Label>
            <Form.Select
              value={requiredTier}
              onChange={(e) => setRequiredTier(e.target.value)}
            >
              <option value="none">None (open to all)</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </Form.Select>
          </Form.Group>

          {error && <div className="text-attention mb-3">{error}</div>}

          <Button variant={null} className="btn-action-primary" type="submit">
            Save Changes
          </Button>
        </Form>
      </div>
    </Container>
  );
}
