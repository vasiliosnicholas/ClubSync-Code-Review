import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import WarningIcon from "../../../../components/icons/WarningIcon.jsx";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

function DetailRow({ label, children, className = "mb-1" }) {
  return (
    <p className={className}>
      <strong>{label}:</strong> {children}
    </p>
  );
}

export default function DuesReviewModal({
  submission,
  show,
  decision,
  setDecision,
  denyReason,
  setDenyReason,
  submitting,
  error,
  onHide,
  onSubmit,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Dues Submission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submission && (
          <>
            <DetailRow label="Name">
              {submission.firstName} {submission.lastName}
            </DetailRow>
            <DetailRow label="Email">{submission.email}</DetailRow>
            <DetailRow label="Submitted">
              {formatDate(submission.submittedAt)}
            </DetailRow>
            <DetailRow label="Dues Tier">
              <span className={`status-badge ${submission.tier}`}>
                {submission.tier}
              </span>
            </DetailRow>
            <DetailRow label="Amount Due">
              {submission.amount != null ? `$${submission.amount}` : "—"}
            </DetailRow>
            <DetailRow label="Payment Method">
              {submission.paymentMethod === "check" ? "Check" : "Venmo"}
            </DetailRow>
            <DetailRow label="Payment Reference" className="mb-3">
              {submission.paymentReference || "—"}
            </DetailRow>

            {decision === "denied" && (
              <Form.Group controlId="denyReason">
                <Form.Label>Reason for denial</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  placeholder="Explain why this submission is being denied"
                />
              </Form.Group>
            )}

            {error && <p className="text-attention small mt-2 mb-0">{error}</p>}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {decision === "denied" ? (
          <>
            <Button
              variant={null}
              className="btn-action-secondary"
              onClick={() => setDecision(null)}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              variant={null}
              className="btn-action-danger"
              onClick={() => onSubmit("denied")}
              disabled={submitting}
            >
              <WarningIcon />
              Confirm Denial
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={null}
              className="btn-action-danger"
              onClick={() => setDecision("denied")}
              disabled={submitting}
            >
              <WarningIcon />
              Deny
            </Button>
            <Button
              variant={null}
              className="btn-action-approve"
              onClick={() => onSubmit("approved")}
              disabled={submitting}
            >
              Approve
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

DetailRow.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

DuesReviewModal.propTypes = {
  submission: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    submittedAt: PropTypes.string,
    tier: PropTypes.string,
    amount: PropTypes.number,
    paymentReference: PropTypes.string,
    paymentMethod: PropTypes.string,
  }),
  show: PropTypes.bool,
  decision: PropTypes.string,
  setDecision: PropTypes.func,
  denyReason: PropTypes.string,
  setDenyReason: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onHide: PropTypes.func,
  onSubmit: PropTypes.func,
};
