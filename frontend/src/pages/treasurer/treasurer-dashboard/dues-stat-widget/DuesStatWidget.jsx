import { Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import PropTypes from "prop-types";

export default function DuesStatWidget({
  title,
  subtitle,
  label,
  count = 0,
  total = 0,
  context,
}) {
  return (
    <Col xs={12} md={5} lg={4} className="role-card dues-stat-widget">
      <Card className="h-100 dues-card dues-card-crimson d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            {subtitle}
          </Card.Subtitle>

          <Card className="dues-inner-card mt-auto">
            <Card.Body className="p-3">
              <div className="inner-card-header text-uppercase">{label}</div>
              <div className="inner-card-subheader dues-stat-ratio my-1">
                {count}
                {total > 0 && <span className="text-secondary-muted fs-4">/{total}</span>}
              </div>
              <hr className="dues-stat-divider my-2" />
              <div className="inner-card-context small text-secondary-muted">
                {context}
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Col>
  );
}

DuesStatWidget.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  label: PropTypes.string,
  count: PropTypes.number,
  total: PropTypes.number,
  context: PropTypes.string,
};
