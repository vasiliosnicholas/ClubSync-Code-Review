import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import WarningIcon from "../../../../components/icons/WarningIcon.jsx";

export default function NewSemesterModal({
  show,
  name,
  setName,
  submitting,
  error,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Start New Semester</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="semesterName">
          <Form.Label>New semester name</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Fall 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          disabled={submitting}
        >
          <WarningIcon />
          Start Semester
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

NewSemesterModal.propTypes = {
  show: PropTypes.bool,
  name: PropTypes.string,
  setName: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
};
