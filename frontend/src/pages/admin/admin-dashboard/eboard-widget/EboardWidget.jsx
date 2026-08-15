import { useEffect, useState } from "react";
import { useUser } from "../../../../context/UserContext.jsx";
import WidgetCard from "../../../../components/widget/WidgetCard.jsx";
import PreviewList from "../../../../components/widget/PreviewList.jsx";

// officerSince wasn't tracked before this field existed, so officers promoted
// prior to that show as "Unknown" rather than a misleading fake duration.
function formatTenure(officerSince) {
  if (!officerSince) return "Unknown";
  const start = new Date(officerSince);
  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 1) return "New";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${months} mo`;
  if (remainingMonths === 0) return `${years} yr`;
  return `${years} yr ${remainingMonths} mo`;
}

// e-board = anyone above the base "member" role — there's no separate
// officer-title field, so role is the only signal we have.
const COLUMNS = [
  { label: "Name", size: 4, render: (m) => `${m.firstName} ${m.lastName}` },
  {
    label: "Officer Since",
    size: 3,
    offset: 1,
    render: (m) => formatTenure(m.officerSince),
  },
  {
    label: "Role",
    size: 3,
    offset: 1,
    align: "end",
    render: (m) => <span className="text-capitalize">{m.role}</span>,
  },
];

export default function EboardWidget() {
  const [eboard, setEboard] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.groupId) return;
    const loadEboard = async () => {
      try {
        const res = await fetch("/api/users?pageSize=all", {
          credentials: "include",
        });
        if (!res.ok) return;
        const { members } = await res.json();
        setEboard(members.filter((m) => m.role !== "member"));
      } catch (error) {
        console.error("Failed to load e-board", error);
      }
    };
    loadEboard();
  }, [user?.groupId]);

  return (
    <WidgetCard
      title="E-Board"
      subtitle="Club Officers"
      badge={`${eboard.length} Officers`}
    >
      <PreviewList
        columns={COLUMNS}
        items={eboard}
        total={eboard.length}
        emptyMessage="No officers have been appointed yet."
        rowKey={(m) => m._id}
      />
    </WidgetCard>
  );
}
