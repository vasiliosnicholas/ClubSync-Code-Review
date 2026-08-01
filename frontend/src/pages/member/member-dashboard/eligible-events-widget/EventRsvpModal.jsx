import { Modal, Button } from "react-bootstrap";
import RSVPButton from "../../../events/rsvp-button/RSVPButton.jsx";
import PropTypes from "prop-types";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

export default function EventRsvpModal({ event, show, eligible, onHide }) {
  const tier = event?.requiredTier ?? "none";
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{event?.name ?? "Event"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {event && (
          <>
            <p className="mb-1">
              <strong>Type:</strong> {event.type}
            </p>
            <p className="mb-1">
              <strong>Location:</strong> {event.location}
            </p>
            <p className="mb-1">
              <strong>Date:</strong> {formatDate(event.date)}
            </p>
            <p className="mb-3">
              <strong>Required Tier:</strong>{" "}
              <span className={`status-badge ${tier}`}>
                {tier === "none" ? "Open" : tier}
              </span>
            </p>

            {eligible ? (
              <RSVPButton eventId={event._id} />
            ) : (
              <p className="text-attention small mb-0">
                This event requires approved {tier} tier dues to RSVP.
              </p>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant={null} className="btn-action-secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

EventRsvpModal.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    location: PropTypes.string,
    date: PropTypes.string,
    requiredTier: PropTypes.string,
  }),
  show: PropTypes.bool,
  eligible: PropTypes.bool,
  onHide: PropTypes.func,
};
