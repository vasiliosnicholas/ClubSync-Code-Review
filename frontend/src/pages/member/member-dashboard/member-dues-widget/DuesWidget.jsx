import { Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router";
import InnerDuesCard from "./InnerDuesCard";
import "./dues-widget.css";
import PropTypes from "prop-types";
import WarningIcon from "../../../../components/icons/WarningIcon.jsx";

const TIER_LABELS = {
  silver: "Silver",
  gold: "Gold",
};

// a member can (re)submit only when they've never submitted or were denied
// pending/approved members have nothing to do here.
const SUBMITTABLE = ["not_submitted", "denied"];

const DUES_CONTENT_MAP = {
  pending: {
    header: "Awaiting Approval",
    subheader: "Review Pending",
    context: "An treasurer is currently verifying your submission.",
  },
  approved: {
    header: "Account Active",
    subheader: "Paid & Verified",
    context: "Membership in good standing until the end of semester.",
  },
  denied: {
    header: "Action Required",
    subheader: "Submission Denied",
    context: "Please contact an admin or retry your submission.",
  },
  not_submitted: {
    header: "Next Payment Due",
    subheader: "No Submissions",
    context: "Submit your dues to your club to participate in events.",
  },
};

export default function DuesWidget({ user }) {
  const statusKey = user?.duesStatus || "not_submitted";
  const content = DUES_CONTENT_MAP[statusKey];

  return (
    <Col xs={12} md={6} lg={6} className="role-card member-dues-widget">
      <Card className="h-100 dues-card d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>Financial Overview</Card.Title>

          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            Dues Status{" "}
            <span className={`status-badge ${statusKey}`}>
              {(user?.duesStatus || "Unknown").replace("_", " ")}
            </span>
          </Card.Subtitle>

          <Card.Text className="d-flex align-items-center">
            <span>
              Tier: {TIER_LABELS[user?.duesTier] || "None"}
              {user?.duesAmount != null && ` ($${user.duesAmount})`}
            </span>
          </Card.Text>

          <Card className="dues-inner-card mt-auto">
            <Card.Body>
              <InnerDuesCard componentInfo={content} />
            </Card.Body>
          </Card>

          {SUBMITTABLE.includes(statusKey) && (
            <Button
              as={Link}
              to="/member/dues-status"
              variant={null}
              className="btn-action-primary mt-3"
            >
              Submit Dues
            </Button>
          )}
        </Card.Body>

        {statusKey === "pending" && (
          <Button
            as={Link}
            to="/member/dues-status"
            variant={null}
            className="btn-action-danger m-3 mt-0"
          >
            <WarningIcon />
            Withdraw Submission
          </Button>
        )}
      </Card>
    </Col>
  );
}

DuesWidget.propTypes = {
  user: PropTypes.shape({
    duesStatus: PropTypes.string,
    duesTier: PropTypes.string,
    duesAmount: PropTypes.number,
  }),
};
