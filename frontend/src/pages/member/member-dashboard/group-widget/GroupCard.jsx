import Card from "react-bootstrap/Card";
import PropTypes from "prop-types";

// card showing the club/semester the member belongs to and
// whether that semester is still the active one.
export default function GroupCard({ group }) {
  return (
    <Card className="h-100 dues-card dues-card-crimson d-flex flex-column justify-content-between">
      <Card.Body className="d-flex flex-column">
        <Card.Title>Your Club</Card.Title>
        <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
          Membership
          <span
            className={`status-badge ${group?.active ? "approved" : "denied"}`}
          >
            {group?.active ? "Active" : "Past"}
          </span>
        </Card.Subtitle>

        <Card className="dues-inner-card mt-auto">
          <Card.Body className="p-3">
            <div className="inner-card-header text-uppercase">Semester</div>
            <div className="inner-card-subheader dues-stat-ratio my-1">
              {group?.name ?? "—"}
            </div>
            <hr className="dues-stat-divider my-2" />
            <div className="inner-card-context small text-secondary-muted">
              Join code: {group?.joinCode ?? "—"}
            </div>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
}

GroupCard.propTypes = {
  group: PropTypes.shape({
    name: PropTypes.string,
    joinCode: PropTypes.string,
    active: PropTypes.bool,
  }),
};
