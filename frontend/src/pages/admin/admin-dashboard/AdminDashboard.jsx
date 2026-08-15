import { Container, Row } from "react-bootstrap";
import StatWidget from "../../../components/widget/StatWidget";
import EboardWidget from "./eboard-widget/EboardWidget.jsx";
import UpcomingEventsWidget from "./upcoming-events-widget/UpcomingEventsWidget.jsx";
import NewSemesterWidget from "./new-semester-widget/NewSemesterWidget.jsx";
import { useUser } from "../../../context/UserContext";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [memberCount, setMemberCount] = useState(0);
  const [participation, setParticipation] = useState({
    participatingCount: 0,
    memberCount: 0,
    eventsConsidered: 0,
  });
  const { user } = useUser();
  // bumped after a semester reset so member/participation stats refetch (the
  // group id is unchanged, so their own effects wouldn't fire otherwise).
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user.groupId) return;
    const loadMemberCount = async () => {
      try {
        const res = await fetch("/api/users/count", { credentials: "include" });
        if (!res.ok) return;
        const { membersCount } = await res.json();
        setMemberCount(membersCount);
      } catch (error) {
        console.error("Failed to load member count", error);
      }
    };
    const loadParticipation = async () => {
      try {
        const res = await fetch("/api/events/participation", {
          credentials: "include",
        });
        if (!res.ok) return;
        setParticipation(await res.json());
      } catch (error) {
        console.error("Failed to load member participation", error);
      }
    };
    loadMemberCount();
    loadParticipation();
  }, [user?.groupId, refreshKey]);

  return (
    <>
      <title>Admin Dashboard · ClubSync</title>
      <meta
        name="description"
        content="This is a admin dashboard page that displays overview club info useful to an admin like total members in club, member event-participation rate, e-board list, an upcoming-events widget with RSVP counts for the closest 5 events, and the functionality for starting a new semester"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <Container className="px-5">
        <h1 className="moto">{user.firstName}'s Admin Dashboard</h1>
        <p className="lead-text spacing-after-moto">
          View the data below to get a sense of how your club is running. Get
          total member numbers, e-board list and view upcoming events with RSVP
          counts.
        </p>

        <h2 className="sub-header-after-moto">Member Stats</h2>
        <hr />
        <Row className="justify-content-center gy-4">
          <StatWidget
            title="Total Members"
            subtitle="Club Roster"
            label="Members"
            count={memberCount}
            context="Includes all members currently in the club."
          />
          <StatWidget
            title="Member Participation"
            subtitle="RSVP Rate"
            label="Participating"
            count={participation.participatingCount}
            total={participation.memberCount}
            context={`Members who RSVP'd to at least one of the last ${participation.eventsConsidered} events.`}
          />
        </Row>

        <h2 className="sub-header-after-moto">Upcoming Events Control</h2>
        <hr />
        <Row className="justify-content-center gy-4 mt-1">
          <UpcomingEventsWidget />
        </Row>

        <h2 className="sub-header-after-moto">New Semester</h2>
        <hr />
        <Row className="justify-content-center gy-4 mt-1">
          <NewSemesterWidget
            onSemesterStarted={() => setRefreshKey((key) => key + 1)}
          />
        </Row>

        <h2 className="sub-header-after-moto">E-Board View</h2>
        <hr />
        <Row className="justify-content-center gy-4 mt-1">
          <EboardWidget />
        </Row>
      </Container>
    </>
  );
}
