import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

export default function Pager({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  return (
    <div className="d-flex align-items-center justify-content-between mt-3">
      <Button
        variant={null}
        className="btn-action-secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="small text-secondary-muted">
        Page {page} of {pageCount}
      </span>
      <Button
        variant={null}
        className="btn-action-secondary"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

Pager.propTypes = {
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
