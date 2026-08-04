import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext.jsx";
import WidgetCard from "../../../../components/widget/WidgetCard.jsx";
import PreviewList from "../../../../components/widget/PreviewList.jsx";
import DuesReviewModal from "./DuesReviewModal.jsx";
import PropTypes from "prop-types";

// column config for the pending-dues list (see PreviewList).
const COLUMNS = [
  { label: "Name", size: 2, render: (m) => `${m.firstName} ${m.lastName}` },
  { label: "Email", size: 7, render: (m) => m.email },
  {
    label: "Dues Tier",
    size: 3,
    align: "end",
    render: (m) => <span className={`status-badge ${m.tier}`}>{m.tier}</span>,
  },
];

export default function DuesVerificationWidget({
  previewLimit = 0,
  refreshSignal = 0,
}) {
  const [pending, setPending] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState(null);
  const [denyReason, setDenyReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // bumped after a successful review so the effect below refetches the queue.
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useUser();

  // previewLimit > 0  = read-only dashboard preview (oldest N submissions).
  // previewLimit <= 0 = full review mode: every pending row is clickable and
  // opens a modal where the treasurer approves or denies the submission.
  const isPreview = previewLimit > 0;

  useEffect(() => {
    if (!user?.groupId) return;
    const loadPending = async () => {
      try {
        const res = await fetch(
          `/api/dues/pending/${user.groupId}/${previewLimit}`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        setPending(data.pending);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to load pending dues", err);
      }
    };
    loadPending();
  }, [user?.groupId, previewLimit, refreshKey, refreshSignal]);

  const openReview = (member) => {
    setSelected(member);
    setDecision(null);
    setDenyReason("");
    setError("");
  };

  const closeReview = () => {
    if (submitting) return;
    setSelected(null);
  };

  // sends the treasurer's decision, a denial must carry a reason. The decision
  // is passed in explicitly so "Approve" can submit without waiting on state.
  const submitReview = async (finalDecision) => {
    const reviewNote = denyReason.trim();
    if (finalDecision === "denied" && !reviewNote) {
      setError("A reason is required to deny a submission.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/dues/review/${selected.submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ decision: finalDecision, reviewNote }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Failed to submit review.");
        return;
      }
      setSelected(null);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      console.error("Failed to submit dues review", err);
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <WidgetCard
        title="Pending Dues Verification"
        subtitle="Members Awaiting Approval"
        badge={`${total} Pending`}
        footer={
          isPreview && (
            <>
              <span>
                Only displays up to 5 members with the oldest dues submissions
              </span>
              <span>
                To view all dues submissions navigate to the dues tab on the nav
                bar
              </span>
            </>
          )
        }
      >
        <PreviewList
          columns={COLUMNS}
          items={pending}
          total={total}
          emptyMessage="No members are awaiting dues approval."
          onSelect={isPreview ? undefined : openReview}
          rowKey={(m) => m.submissionId}
        />
      </WidgetCard>

      <DuesReviewModal
        submission={selected}
        show={!isPreview && !!selected}
        decision={decision}
        setDecision={setDecision}
        denyReason={denyReason}
        setDenyReason={setDenyReason}
        submitting={submitting}
        error={error}
        onHide={closeReview}
        onSubmit={submitReview}
      />
    </>
  );
}

DuesVerificationWidget.propTypes = {
  previewLimit: PropTypes.number,
  refreshSignal: PropTypes.number,
};
