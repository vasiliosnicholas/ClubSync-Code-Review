import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import WarningIcon from "../../../../components/icons/WarningIcon.jsx";

export default function CancelEventModal({
  show,
  eventName,
  submitting,
  error,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cancel Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Cancel <strong>{eventName ?? "this event"}</strong>? This removes it
          for every member and cannot be undone.
        </p>
        {error && <p className="text-attention small mt-2 mb-0">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={null}
          className="btn-action-secondary"
          onClick={onHide}
          disabled={submitting}
        >
          Keep Event
        </Button>
        <Button
          variant={null}
          className="btn-action-danger"
          onClick={onConfirm}
          disabled={submitting}
        >
          <WarningIcon />
          Cancel Event
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

CancelEventModal.propTypes = {
  show: PropTypes.bool,
  eventName: PropTypes.string,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
};
