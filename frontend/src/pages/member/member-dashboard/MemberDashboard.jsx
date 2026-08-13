import { Container, Row } from "react-bootstrap";
import { useUser } from "../../../context/UserContext.jsx";
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
