import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../../../../context/UserContext.jsx";
import WidgetCard from "../../../../components/widget/WidgetCard.jsx";
import PreviewList from "../../../../components/widget/PreviewList.jsx";

const COLUMNS = [
  { label: "Event", size: 5, render: (e) => e.name },
  {
    label: "Date",
    size: 3,
    offset: 1,
    render: (e) => new Date(e.date).toLocaleDateString(),
  },
  {
    label: "RSVPs",
    size: 2,
    offset: 1,
    align: "end",
    render: (e) => e.rsvpCount,
  },
];

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.groupId) return;
    const loadUpcoming = async () => {
      try {
        const res = await fetch("/api/events/upcoming", {
          credentials: "include",
        });
        if (!res.ok) return;
        setEvents(await res.json());
      } catch (error) {
        console.error("Failed to load upcoming events", error);
      }
    };
    loadUpcoming();
  }, [user?.groupId]);

  return (
    <WidgetCard
      title="Upcoming Events Stats"
      subtitle="Next 5 Events"
      badge={`${events.length} Scheduled`}
    >
      <PreviewList
        columns={COLUMNS}
        items={events}
        total={events.length}
        emptyMessage="No upcoming events are scheduled."
        onSelect={(e) => navigate(`/admin/events/${e.id}`)}
        rowKey={(e) => e.id}
      />
    </WidgetCard>
  );
}
