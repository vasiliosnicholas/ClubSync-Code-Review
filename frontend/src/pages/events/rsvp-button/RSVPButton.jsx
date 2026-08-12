import { useState } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";
import "./rsvp-button.css";

export default function RSVPButton({ eventId, initialGoing = false, onRsvp }) {
  // going = is the current user RSVP'd? seeded from the parent, then toggled.
  const [going, setGoing] = useState(initialGoing);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleToggle = async () => {
    setMessage("");

    try {
      // same endpoint, opposite verb: POST to RSVP, DELETE to un-RSVP
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: going ? "DELETE" : "POST",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Could not update your RSVP.");
        return;
      }

      const nowGoing = !going;
      setGoing(nowGoing);
      setIsError(false);
      setMessage(nowGoing ? "You're RSVP'd" : "RSVP cancelled");
      if (onRsvp) onRsvp(data);
    } catch (error) {
      console.error("RSVP request failed", error);
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="rsvp-button">
      <Button
        variant={null}
        className={going ? "btn-action-secondary" : "btn-action-primary"}
        onClick={handleToggle}
      >
        {going ? "Cancel RSVP" : "RSVP"}
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
  initialGoing: PropTypes.bool, // whether the user is already RSVP'd
  onRsvp: PropTypes.func, // optional callback after a successful toggle
};
