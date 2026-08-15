import { Container, Row, Col, Button } from "react-bootstrap";
import RoleCard from "./RoleCard.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { ROLE_ACCESS } from "../basepage/navbar/roleTabs.js";
import groupJpg from "../../assets/group.jpg";
import "./homepage.css";

const ROLES = [
  {
    title: "For members",
    text: "Join with a code, pay dues to unlock tiered events, and RSVP (or cancel) while seeing exactly who else is going.",
  },
  {
    title: "For treasurers",
    text: "Set dues prices, approve or deny submissions with a note, track collections by tier, and manage member discounts.",
  },
  {
    title: "For admins",
    text: "Create, edit, and cancel events, see who's coming with their contact info, track member engagement, manage the roster, and start a new semester.",
  },
];

export default function HomePage() {
  const { user } = useUser();
  const homeTab = ROLE_ACCESS[user?.role]?.[0];

  return (
    <>
      <title>ClubSync</title>
      <meta
        name="description"
        content="Landing page for an guest user that is not signed in. 
        Defines the basic functionality of the app and an option to register/login."
      />
      <Container className="px-5">
        <h1 className="moto">Organization. Verification. Synchronization.</h1>

        <Row className="justify-content-center">
          <Col xs={12} md={8} className="hero-img-col">
            <img
              src={groupJpg}
              fetchPriority="high"
              alt="Group people meeting in a room, discussing plans for their club"
              className="hero-img"
            />
          </Col>
        </Row>

        <h2 className="what-is-this">That's ClubSync.</h2>

        <Row className="justify-content-center gx-3">
          <Col xs={12} md={8} className="intro-col">
            <p className="lead-text">
              ClubSync replaces the Google Form and spreadsheet routine clubs
              use to track dues and events. No more manually checking who's paid
              before letting people sign up. Members join a group, submit their
              dues, and see exactly which events they're eligible for.
              Treasurers review and approve dues in one place, and admins run
              events without wondering who's actually cleared to show up.
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
            {homeTab ? (
              <Button
                variant={null}
                className="btn-action-primary"
                href={homeTab.to}
              >
                Back to {homeTab.label} View
              </Button>
            ) : (
              <Button
                variant={null}
                className="btn-action-primary"
                href="/login"
              >
                Log In
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}
