import { Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import PropTypes from "prop-types";

// Shared full width dashboard widget shell: the outer role-card column, the
// titled card, a subtitle row with an optional status badge, the body content
// (children), and optional footer notes rendered below the card body. Behaviour
// lives in the widget that renders this.
export default function WidgetCard({ title, subtitle, badge, footer, children }) {
  return (
    <Col xs={12} md={12} lg={12} className="role-card dues-stat-widget">
      <Card className="h-100 dues-card d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            {subtitle}
            {badge != null && (
              <span className="status-badge pending">{badge}</span>
            )}
          </Card.Subtitle>

          {children}
        </Card.Body>
        {footer}
      </Card>
    </Col>
  );
}

WidgetCard.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  badge: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
};
