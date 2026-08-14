import { Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import PropTypes from "prop-types";
import TierInfo from "./TierInfo.jsx";

export default function StatWidget({
  title,
  subtitle,
  label,
  count = 0,
  total = 0,
  prefix = "",
  context,
  widgetSize = 4,
  accent,
  info,
}) {
  return (
    <Col xs={12} md={5} lg={widgetSize} className="role-card dues-stat-widget">
      <Card
        className="h-100 dues-card d-flex flex-column justify-content-between"
        style={accent ? { borderTopColor: accent, borderTopWidth: "5px" } : undefined}
      >
        <Card.Body className="d-flex flex-column">
          <Card.Title>
            {title}
            {info && <TierInfo text={info} />}
          </Card.Title>
          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            {subtitle}
          </Card.Subtitle>

          <Card className="dues-inner-card mt-auto">
            <Card.Body className="p-3">
              <div className="inner-card-header text-uppercase">{label}</div>
              <div className="inner-card-subheader dues-stat-ratio my-1">
                {prefix}
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

StatWidget.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  label: PropTypes.string,
  count: PropTypes.number,
  total: PropTypes.number,
  prefix: PropTypes.string,
  context: PropTypes.string,
  widgetSize: PropTypes.number,
  accent: PropTypes.string,
  info: PropTypes.string,
};
