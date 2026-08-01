import { Container, Row, Col, Button } from "react-bootstrap";
import RoleCard from "./RoleCard.jsx";
import "./homepage.css";

const ROLES = [
  {
    title: "For members",
    text: "Join with a code, submit your dues, and RSVP to events you qualify for. No spreadsheets, no chasing down forms.",
  },
  {
    title: "For treasurers",
    text: "Review dues submissions, approve or deny with a note, and see who's paid at a glance instead of a running spreadsheet.",
  },
  {
    title: "For admins",
    text: "Create events, set who's eligible to attend, and see who's coming before anyone shows up.",
  },
];

export default function HomePage() {
  return (
    <Container className="px-5">
      <h1 className="moto">Organization. Verification. Synchronization.</h1>

      <Row className="justify-content-center">
        <Col xs={12} md={8} className="hero-img-col">
          <img
            src="https://knowledge.wharton.upenn.edu/wp-content/uploads/2024/05/6.5.24-platt-heart-rate-group-decisions-GettyImages-1373240838-650x442.jpg"
            alt="Group of athletes training together"
            className="hero-img"
          />
        </Col>
      </Row>

      <h2 className="what-is-this">That's ClubSync.</h2>

      <Row className="justify-content-center gx-3">
        <Col xs={12} md={8} className="intro-col">
          <p className="lead-text">
            ClubSync replaces the Google Form and spreadsheet routine clubs use
            to track dues and events. No more manually checking who's paid
            before letting people sign up. Members join a group, submit their
            dues, and see exactly which events they're eligible for. Treasurers
            review and approve dues in one place, and admins run events without
            wondering who's actually cleared to show up.
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center gx-3">
        {ROLES.map((role) => (
          <RoleCard key={role.title} title={role.title} text={role.text} />
        ))}
      </Row>

      <Row className="justify-content-center">
        <Col xs="auto" className="note-text">
          New semester, new group, dues reset automatically.
        </Col>
      </Row>

      <Row className="justify-content-center cta-row">
        <Col xs="auto">
          <Button variant={null} className="btn-action-primary" href="/login">
            Log In
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
