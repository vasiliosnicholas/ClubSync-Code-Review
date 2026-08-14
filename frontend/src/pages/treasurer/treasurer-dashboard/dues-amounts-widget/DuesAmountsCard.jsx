import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Col } from "react-bootstrap";
import PropTypes from "prop-types";

export default function DuesAmountsCard({ amounts, onEdit }) {
  return (
    <Col xs={12} md={5} lg={4} className="role-card dues-stat-widget">
      <Card className="h-100 dues-card d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>Tier Pricing</Card.Title>
          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            This Semester
          </Card.Subtitle>

          <Card className="dues-inner-card mt-auto">
            <Card.Body className="p-3">
              <div className="inner-card-header text-uppercase">
                Gold / Silver
              </div>
              <div className="inner-card-subheader dues-stat-ratio my-1">
                ${amounts?.gold ?? "—"}
                <span className="text-secondary-muted fs-4">
                  {" "}
                  / ${amounts?.silver ?? "—"}
                </span>
              </div>
              <hr className="dues-stat-divider my-2" />
              <div className="inner-card-context small text-secondary-muted">
                What members are charged for each tier this semester.
              </div>
            </Card.Body>
          </Card>

          <Button
            variant={null}
            className="btn-action-primary mt-3"
            onClick={onEdit}
          >
            Edit Prices
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
}

DuesAmountsCard.propTypes = {
  amounts: PropTypes.shape({
    gold: PropTypes.number,
    silver: PropTypes.number,
  }),
  onEdit: PropTypes.func,
};
