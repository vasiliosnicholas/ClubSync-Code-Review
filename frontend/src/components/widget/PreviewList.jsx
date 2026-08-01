import { Col, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import PropTypes from "prop-types";

// Shared preview/full list rendered inside a widget's inner card.
export default function PreviewList({
  columns,
  items,
  total,
  emptyMessage,
  onSelect,
  rowKey,
}) {
  const clickable = typeof onSelect === "function";

  return (
    <Card className="dues-inner-card mt-auto">
      <Card.Body className="p-3">
        {total === 0 ? (
          <div className="inner-card-context small text-secondary-muted">
            {emptyMessage}
          </div>
        ) : (
          <>
            <Row className="inner-card-header text-uppercase gx-2">
              {columns.map((col) => (
                <Col
                  key={col.label}
                  xs={col.size}
                  className={col.align === "end" ? "text-end" : undefined}
                >
                  {col.label}
                </Col>
              ))}
            </Row>
            <hr className="dues-stat-divider my-2" />

            {items.map((item) => (
              <Row
                key={rowKey(item)}
                className={`align-items-center gx-2 py-1${
                  clickable ? " dues-review-row" : ""
                }`}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => onSelect(item) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        // keep the clickable row operable by keyboard (Enter/Space).
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(item);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <Col
                    key={col.label}
                    xs={col.size}
                    className={
                      col.align === "end"
                        ? "text-end"
                        : "inner-card-context small text-secondary-muted text-truncate"
                    }
                  >
                    {col.render(item)}
                  </Col>
                ))}
              </Row>
            ))}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

PreviewList.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      size: PropTypes.number,
      align: PropTypes.string,
      render: PropTypes.func.isRequired,
    })
  ).isRequired,
  items: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  emptyMessage: PropTypes.string,
  onSelect: PropTypes.func,
  rowKey: PropTypes.func.isRequired,
};
