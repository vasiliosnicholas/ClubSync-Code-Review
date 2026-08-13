import { Container, Row, Alert } from "react-bootstrap";
import { Link } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";

// states where the member still owes dues and should be reminded to pay.
const UNPAID = ["not_submitted", "denied"];
import DuesWidget from "./member-dues-widget/DuesWidget.jsx";
import JoinGroupWidget from "./join-group-widget/JoinGroupWidget.jsx";
import GroupWidget from "./group-widget/GroupWidget.jsx";
import EligibleEventsWidget from "./eligible-events-widget/EligibleEventsWidget.jsx";

export default function MemberDashboard() {
  const { user } = useUser();
  return (
    <>
      <title>Member Dashboard · ClubSync</title>
      <meta
        name="description"
        content="This is a member dashboard page that displays basic member info like upcoming events, the club that you are a part of and quick dues stats"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <Container className="px-5">
        <h1 className="moto">{user.firstName}'s Member Dashboard</h1>
        <p className="lead-text spacing-after-moto">
          Below is your overview into your clubs necessities; updates on dues
          status and upcoming events.
        </p>

        {user?.groupId && UNPAID.includes(user?.duesStatus) && (
          <Alert
            variant={null}
            className="alert-action-attention spacing-after-moto d-flex flex-wrap justify-content-between align-items-center gap-2"
          >
            <span className="mb-0">
              <strong>Reminder:</strong> your dues aren&apos;t paid yet.{" "}
              {user.duesStatus === "denied"
                ? "Your last submission was denied — please resubmit."
                : "Submit them to unlock RSVPs for tier-gated events."}
            </span>
            <Link to="/member/dues-status" className="btn btn-action-primary">
              Pay dues
            </Link>
          </Alert>
        )}

        <Row className="justify-content-center gy-4">
          {user?.groupId ? (
            <>
              <h2 className="sub-header-after-moto">Club Control</h2>
              <hr />
              <DuesWidget user={user} />
              <GroupWidget />
              <h2 className="sub-header-after-moto">Club Events</h2>
              <hr />
              <EligibleEventsWidget previewLimit={5} />
            </>
          ) : (
            <JoinGroupWidget />
          )}
        </Row>
      </Container>
    </>
  );
}
