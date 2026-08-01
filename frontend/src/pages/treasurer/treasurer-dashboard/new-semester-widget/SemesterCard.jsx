import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";

export default function SemesterCard({ active, onStart }) {
  return (
    <Card className="h-100 dues-card dues-card-teal d-flex flex-column justify-content-between">
      <Card.Body className="d-flex flex-column">
        <Card.Title>Semester Control</Card.Title>
        <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
          Current Semester
          <span className="status-badge approved">
            {active?.name ?? "None"}
          </span>
        </Card.Subtitle>

        <Card className="dues-inner-card mt-auto">
          <Card.Body className="p-3">
            <div className="inner-card-header text-uppercase">Join Code</div>
            <div className="inner-card-subheader dues-stat-ratio my-1">
              {active?.joinCode ?? "—"}
            </div>
            <hr className="dues-stat-divider my-2" />
            <div className="inner-card-context small text-secondary-muted">
              Starting a new semester issues a new join code and clears the
              current roster. Every member must re-join.
            </div>
          </Card.Body>
        </Card>

        <Button
          variant={null}
          className="btn-action-primary mt-3"
          onClick={onStart}
        >
          Start New Semester
        </Button>
      </Card.Body>
    </Card>
  );
}

SemesterCard.propTypes = {
  active: PropTypes.shape({
    name: PropTypes.string,
    joinCode: PropTypes.string,
  }),
  onStart: PropTypes.func,
};
