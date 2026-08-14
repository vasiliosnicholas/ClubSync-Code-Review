import { useState } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";
import "./rsvp-button.css";
import { useToast } from "../../../context/ToastContext";

export default function RSVPButton({ eventId, initialGoing = false, onRsvp }) {
  const { showToast } = useToast();
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
        const errorMessage = data.message || "Could not update your RSVP.";
        setIsError(true);
        setMessage(errorMessage);
        showToast(errorMessage, "danger");
        return;
      }

      const nowGoing = !going;
      setGoing(nowGoing);
      setIsError(false);
      showToast(nowGoing ? "Successfully RSVP'd" : "RSVP cancelled successfully");
      setMessage(nowGoing ? "You're RSVP'd" : "RSVP cancelled");
      if (onRsvp) onRsvp(data);
    } catch (error) {
      console.error("RSVP request failed", error);
      setIsError(true);
      showToast("Failed to handle RSVP request", "danger");
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
