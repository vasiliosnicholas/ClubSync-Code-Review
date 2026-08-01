import { Container, Row } from "react-bootstrap";
import { useUser } from "../../../context/UserContext.jsx";
import DuesWidget from "./member-dues-widget/DuesWidget.jsx";
import JoinGroupWidget from "./join-group-widget/JoinGroupWidget.jsx";
import GroupWidget from "./group-widget/GroupWidget.jsx";
import EligibleEventsWidget from "./eligible-events-widget/EligibleEventsWidget.jsx";

export default function MemberDashboard() {
  const { user } = useUser();
  return (
    <Container className="px-5">
      <h1 className="moto">{user.firstName}'s Member Dashboard</h1>
      <p className="lead-text spacing-after-moto">
        Below is your overview into your clubs necessities; updates on dues
        status and upcoming events.
      </p>

      <Row className="justify-content-center gy-4">
        {user?.groupId ? (
          <>
            <DuesWidget user={user} />
            <GroupWidget />
            <EligibleEventsWidget previewLimit={5} />
          </>
        ) : (
          <JoinGroupWidget />
        )}
      </Row>
    </Container>
  );
}
