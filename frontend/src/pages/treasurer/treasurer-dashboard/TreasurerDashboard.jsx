import { Container, Row } from "react-bootstrap";
import { useUser } from "../../../context/UserContext.jsx";
import StatWidget from "../../../components/widget/StatWidget.jsx";
import DuesVerificationWidget from "./dues-verification-widget/DuesVerificationWidget.jsx";
import NewSemesterWidget from "./new-semester-widget/NewSemesterWidget.jsx";
import { useState, useEffect } from "react";

export default function TreasurerDashboard() {
  const [stats, setStats] = useState({
    gold: 0,
    silver: 0,
    total: 0,
    memberCount: 0,
  });
  // bumped after a semester reset so every widget on the dashboard refetches
  // (the club id is unchanged, so their own effects wouldn't fire otherwise).
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.groupId) return;
    const loadStats = async () => {
      try {
        const res = await fetch(`/api/dues/stats/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        setStats(await res.json());
      } catch (err) {
        console.error("Failed to load dues stats", err);
      }
    };
    loadStats();
  }, [user?.groupId, refreshKey]);

  return (
    <Container className="px-5">
      <title>Treasurer Dashboard · ClubSync</title>
      <meta
        name="description"
        content="Treasurer dashboard page that displays basic club dues info. 
        Shows a breakdown of total dues paid, how many gold tier members, silver tier members, top 5 oldest dues submissions and also the functionality for starting a new semester. "
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <h1 className="moto">
        {user.firstName}'s Treasurer Dashboard
      </h1>
      <p className="lead-text spacing-after-moto">
        Below is your one stop shop for dues statistics, dues approvals, and
        group creation
      </p>

      <Row className="justify-content-center gy-4">
        <StatWidget
          title="Total Dues Verified"
          subtitle="Approved Members"
          label="Approved Ratio"
          count={stats.total}
          total={stats.memberCount}
          context="Includes all active Silver and Gold tier submissions."
        />
        <StatWidget
          title="Gold Tier"
          subtitle="Approved Members"
          label="Gold"
          count={stats.gold}
          context="Includes all members approved with Gold tier dues."
        />
        <StatWidget
          title="Silver Tier"
          subtitle="Approved Members"
          label="Silver"
          count={stats.silver}
          context="Includes all members approved with Silver tier dues."
        />
        <DuesVerificationWidget previewLimit={5} refreshSignal={refreshKey} />
        <NewSemesterWidget
          onSemesterStarted={() => setRefreshKey((key) => key + 1)}
        />
      </Row>
    </Container>
  );
}
