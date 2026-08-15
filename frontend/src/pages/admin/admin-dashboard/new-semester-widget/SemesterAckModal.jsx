import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import WarningIcon from "../../../../components/icons/WarningIcon.jsx";

const ACK_PHRASE = "I Understand";

export default function SemesterAckModal({
  show,
  ackText,
  setAckText,
  onHide,
  onContinue,
}) {
  const confirmed = ackText.trim().toLowerCase() === ACK_PHRASE.toLowerCase();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Start New Semester</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>What does this do?</h4>
        <ul>
          <li>Creates a new semester with a fresh join code</li>
          <li><strong>Detaches every current member</strong></li>
          <li>Resets all users dues to not submitted.</li> 
          <li>All events (past and upcoming) for this semester are
          deleted with this action.</li>
          <li>Admin and Treasurers stay on the roster after a new semester</li>
        </ul>
        <strong><em>This cannot be undone</em></strong> <hr/>
        <Form.Group controlId="semesterAck">
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
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={null}
          className="btn-action-secondary"
          onClick={onHide}
        >
          Cancel
        </Button>
        <Button
          variant={null}
          className="btn-action-danger"
          onClick={onContinue}
          disabled={!confirmed}
        >
          <WarningIcon />
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

SemesterAckModal.propTypes = {
  show: PropTypes.bool,
  ackText: PropTypes.string,
  setAckText: PropTypes.func,
  onHide: PropTypes.func,
  onContinue: PropTypes.func,
};
