import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import PropTypes from "prop-types";

// join by code card: a member enters the club's active join code
// to attach themselves to the current semester's roster.
export default function JoinGroupCard({
  joinCode,
  setJoinCode,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <Card className="h-100 dues-card d-flex flex-column justify-content-between">
      <Card.Body className="d-flex flex-column">
        <Card.Title>Join Your Club</Card.Title>
        <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
          Membership
          <span className="status-badge not_submitted">Not Joined</span>
        </Card.Subtitle>

        <Card className="dues-inner-card mt-auto">
          <Card.Body className="p-3">
            <div className="inner-card-context small text-secondary-muted mb-3">
              Enter the join code your treasurer shared to join this semester's
              roster.
            </div>
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3" controlId="joinCode">
                <Form.Label>Join code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 482913"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
              </Form.Group>
              {error && <p className="text-attention small mb-3">{error}</p>}
              <Button
                variant={null}
                className="btn-action-primary"
                type="submit"
                disabled={submitting}
              >
                Join Club
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
}

JoinGroupCard.propTypes = {
  joinCode: PropTypes.string,
  setJoinCode: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.string,
};
