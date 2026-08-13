import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";

// Shown as a mandatory, non-dismissable gate the first time a treasurer opens
// their dashboard each semester (mandatory=true), and as a normal editable
// modal any other time the treasurer wants to change the prices.
export default function DuesAmountsModal({
  show,
  mandatory,
  gold,
  setGold,
  silver,
  setSilver,
  submitting,
  error,
  onHide,
  onConfirm,
}) {
  return (
    <Modal
      show={show}
      onHide={mandatory ? undefined : onHide}
      backdrop={mandatory ? "static" : true}
      keyboard={!mandatory}
      centered
    >
      <Modal.Header closeButton={!mandatory}>
        <Modal.Title>
          {mandatory ? "Set This Semester's Dues" : "Edit Dues Prices"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {mandatory
            ? "Before anything else on your dashboard is available, set what Gold and Silver tier dues cost this semester."
            : "Changing a price only affects members who submit dues after this change. Already-submitted or approved dues keep the price they were shown at the time."}
        </p>
        <p className="text-secondary-muted small">
          Members will see this price when they select a tier, and it's added
          to the club-wide total only once you approve their submission.
        </p>
        <Form.Group className="mb-3" controlId="dues-amount-gold">
          <Form.Label>Gold tier price ($)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            step="0.01"
            value={gold}
            onChange={(e) => setGold(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="dues-amount-silver">
          <Form.Label>Silver tier price ($)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            step="0.01"
            value={silver}
            onChange={(e) => setSilver(e.target.value)}
          />
        </Form.Group>
        {error && <p className="text-attention small mt-2 mb-0">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        {!mandatory && (
          <Button
            variant={null}
            className="btn-action-secondary"
            onClick={onHide}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          variant={null}
          className="btn-action-primary"
          onClick={onConfirm}
          disabled={submitting}
        >
          Save Prices
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

DuesAmountsModal.propTypes = {
  show: PropTypes.bool,
  mandatory: PropTypes.bool,
  gold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setGold: PropTypes.func,
  silver: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setSilver: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
};
