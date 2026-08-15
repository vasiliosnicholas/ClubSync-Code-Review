import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import WarningIcon from "../../../../components/icons/WarningIcon.jsx";

const ACK_PHRASE = "I Understand";

export default function LeaveClubModal({
  show,
  groupName,
  ackText,
  setAckText,
  submitting,
  error,
  onHide,
  onConfirm,
}) {
  const confirmed = ackText.trim().toLowerCase() === ACK_PHRASE.toLowerCase();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h3">Leave Club</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>What does this do?</h4>
        <ul>
          <li>Removes you from {groupName ?? "this club"}</li>
          <li>
            <strong>Resets your dues status</strong>
          </li>
          <li>You lose access to this club&apos;s dues and events</li>
          <li>You&apos;ll need a join code to rejoin</li>
        </ul>
        <hr />
        <Form.Group controlId="leaveClubAck">
          <Form.Label>
            Type <strong>{ACK_PHRASE}</strong> to continue
          </Form.Label>
          <Form.Control
            type="text"
            placeholder={ACK_PHRASE}
            value={ackText}
            onChange={(e) => setAckText(e.target.value)}
          />
        </Form.Group>
        {error && <p className="text-attention small mt-2 mb-0">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={null}
          className="btn-action-secondary"
          onClick={onHide}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant={null}
          className="btn-action-danger"
          onClick={onConfirm}
          disabled={!confirmed || submitting}
        >
          <WarningIcon />
          Leave Club
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

LeaveClubModal.propTypes = {
  show: PropTypes.bool,
  groupName: PropTypes.string,
  ackText: PropTypes.string,
  setAckText: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
};
