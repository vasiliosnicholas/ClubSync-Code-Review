import { useState } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useToast } from "../../../context/ToastContext.jsx";
import TierInfo from "../../../components/widget/TierInfo.jsx";
import "./event-form.css";

export default function EventForm({ onCreated }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("social"); // sensible defaults
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [requiredTier, setRequiredTier] = useState("none");
  const [error, setError] = useState("");
  const [createdEvent, setCreatedEvent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); //stop the browser's default full-page form reload
    setError(""); //This will clear any error from previous attempts

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, type, date, location, requiredTier }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.message || "Could not creat an event";
        setError(message);
        showToast(message, "danger");
        return;
      }

      const data = await res.json();
      setCreatedEvent(data);
      setName("");
      showToast(`Event "${data.name}" created successfully!`);
      if (onCreated) onCreated(data);
    } catch (error) {
      console.error("Create events request failed", error);
      showToast("Failed to create event", "danger");
      setError("Sorry something went long please try again in a bit");
    }
  };

  return (
    <div className="event-form">
      <h2>Create an Event</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="event-name">
          <Form.Label>Event name</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Season Opener Social"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="event-type">
          <Form.Label>Type</Form.Label>
          <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="practice">Practice</option>
            <option value="social">Social</option>
            <option value="meeting">Meeting</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="event-date">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="event-location">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Main Campus Plaza"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="event-required-tier">
          <Form.Label>Required tier</Form.Label>
          <TierInfo text="Only members with approved dues at this tier or higher can RSVP. “None” means open to all." />

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
          Create Event
        </Button>
      </Form>

      {createdEvent && (
        <div className="event-created-panel mt-4">
          <p>
            Event created: <strong>{createdEvent.name}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

EventForm.propTypes = {
  onCreated: PropTypes.func,
};
