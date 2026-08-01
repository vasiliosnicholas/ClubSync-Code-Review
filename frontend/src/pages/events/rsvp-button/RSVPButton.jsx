import { useState } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";
import "./rsvp-button.css";

export default function RSVPButton({ eventId, onRsvp }) {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRsvp = async () => {
    setMessage("");

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Could not RSVP.");
        return;
      }

      setIsError(false);
      setMessage("You're RSVP'd");
      if (onRsvp) onRsvp(data);
    } catch (error) {
      console.error("RSVP request failed", error);
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="rsvp-button">
      <Button variant={null} className="btn-action-primary" onClick={handleRsvp}>
        RSVP
      </Button>

      {/* show the message only when there is one; color it by isError */}
      {message && (
        <p className={isError ? "text-attention mt-2" : "text-positive mt-2"}>
          {message}
        </p>
      )}
    </div>
  );
}

// propTypes (outside, at the bottom)
RSVPButton.propTypes = {
  eventId: PropTypes.string.isRequired, // required — component can't work without it
  onRsvp: PropTypes.func, // optional
};
