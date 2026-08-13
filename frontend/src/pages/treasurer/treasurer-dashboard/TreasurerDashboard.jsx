import { Container, Row } from "react-bootstrap";
import { useUser } from "../../../context/UserContext.jsx";
import StatWidget from "../../../components/widget/StatWidget.jsx";
import DuesVerificationWidget from "./dues-verification-widget/DuesVerificationWidget.jsx";
import NewSemesterWidget from "./new-semester-widget/NewSemesterWidget.jsx";
import DuesAmountsModal from "./dues-amounts-widget/DuesAmountsModal.jsx";
import DuesAmountsCard from "./dues-amounts-widget/DuesAmountsCard.jsx";
import DiscountsWidget from "./discounts-widget/DiscountsWidget.jsx";
import DiscountTypesWidget from "./discount-types-widget/DiscountTypesWidget.jsx";
import { useState, useEffect } from "react";

export default function TreasurerDashboard() {
  const [stats, setStats] = useState({
    gold: 0,
    silver: 0,
    total: 0,
    memberCount: 0,
    totalAmount: 0,
  });
  // bumped after a semester reset so every widget on the dashboard refetches
  // (the club id is unchanged, so their own effects wouldn't fire otherwise).
  const [refreshKey, setRefreshKey] = useState(0);
  const [group, setGroup] = useState(null);
  const [editingAmounts, setEditingAmounts] = useState(false);
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [savingAmounts, setSavingAmounts] = useState(false);
  const [amountsError, setAmountsError] = useState("");
  const { user } = useUser();

  useEffect(() => {
    if (!user?.groupId) return;
    const loadClub = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        setGroup(await res.json());
      } catch (err) {
        console.error("Failed to load your club", err);
      }
    };
    loadClub();
  }, [user?.groupId, refreshKey]);

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

  // dues prices must be set before anything else on the dashboard is usable;
  // they're cleared at the start of every new semester (see NewSemesterWidget).
  // While the club is still loading, hide the row rather than flashing it.
  const groupLoaded = !!group;
  const pricesUnset = !!user?.groupId && groupLoaded && !group.duesAmounts;
  const showRow = !user?.groupId || (groupLoaded && !pricesUnset);
  const showAmountsModal = pricesUnset || editingAmounts;

  const openEditAmounts = () => {
    setGold(group?.duesAmounts?.gold ?? "");
    setSilver(group?.duesAmounts?.silver ?? "");
    setAmountsError("");
    setEditingAmounts(true);
  };

  const closeEditAmounts = () => {
    if (savingAmounts) return;
    setEditingAmounts(false);
  };

  const saveAmounts = async () => {
    const goldValue = Number(gold);
    const silverValue = Number(silver);
    if (!Number.isFinite(goldValue) || goldValue < 0) {
      setAmountsError("Enter a valid Gold tier price.");
      return;
    }
    if (!Number.isFinite(silverValue) || silverValue < 0) {
      setAmountsError("Enter a valid Silver tier price.");
      return;
    }

    setSavingAmounts(true);
    setAmountsError("");
    try {
      const res = await fetch("/api/groups/dues-amounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ gold: goldValue, silver: silverValue }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAmountsError(data.message ?? "Could not save dues prices.");
        return;
      }
      setGroup(await res.json());
      setEditingAmounts(false);
    } catch (err) {
      console.error("Failed to save dues prices", err);
      setAmountsError("Something went wrong. Please try again.");
    } finally {
      setSavingAmounts(false);
    }
  };

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

      <DuesAmountsModal
        show={showAmountsModal}
        mandatory={pricesUnset}
        gold={gold}
        setGold={setGold}
        silver={silver}
        setSilver={setSilver}
        submitting={savingAmounts}
        error={amountsError}
        onHide={closeEditAmounts}
        onConfirm={saveAmounts}
      />

      {showRow && (
        <Row className="justify-content-center gy-4">
          <h2 className="sub-header-after-moto">Dues Stats</h2>
          <hr />
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
          <StatWidget
            title="Dues Collected"
            subtitle="Club-Wide Total"
            label="Total"
            prefix="$"
            count={stats.totalAmount}
            context="Sum of approved Gold and Silver dues this semester."
          />
          <DuesAmountsCard
            amounts={group?.duesAmounts}
            onEdit={openEditAmounts}
          />
          <h2 className="sub-header-after-moto">Dues Verification</h2>
          <hr />
          <DuesVerificationWidget previewLimit={5} refreshSignal={refreshKey} />
          <h2 className="sub-header-after-moto">Discounts</h2>
          <hr />
          <DiscountTypesWidget
            refreshSignal={refreshKey}
            onChange={() => setRefreshKey((key) => key + 1)}
          />
          <DiscountsWidget
            refreshSignal={refreshKey}
            onChange={() => setRefreshKey((key) => key + 1)}
          />
          <h2 className="sub-header-after-moto">New Semester </h2>
          <hr />
          <NewSemesterWidget
            onSemesterStarted={() => setRefreshKey((key) => key + 1)}
          />
        </Row>
      )}
    </Container>
  );
}
