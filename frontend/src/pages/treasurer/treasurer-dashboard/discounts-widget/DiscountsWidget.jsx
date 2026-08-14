import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form } from "react-bootstrap";
import WidgetCard from "../../../../components/widget/WidgetCard.jsx";
import PreviewList from "../../../../components/widget/PreviewList.jsx";
import { useUser } from "../../../../context/UserContext.jsx";
import { useToast } from "../../../../context/ToastContext.jsx";

// columns for the discount list (sizes add up to 12 across the row)
const DISCOUNT_COLUMNS = [
  { label: "Member", size: 5, render: (m) => `${m.firstName} ${m.lastName}` },
  { label: "Discount", size: 4, render: (m) => m.discount?.name },
  {
    label: "Rate",
    size: 3,
    align: "end",
    render: (m) => `$${m.discount?.amount ?? 0}`,
  },
];

// shows every member on a named discount, and lets the treasurer assign a
// discount to a member or clear one (click a row to edit it).
export default function DiscountsWidget({ refreshSignal, onChange }) {
  const { user } = useUser();
  const { showToast } = useToast();
  const [members, setMembers] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [error, setError] = useState("");

  // assign/clear modal state
  const [showModal, setShowModal] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [discountName, setDiscountName] = useState(""); // "" = clear
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  // bumped to re-fetch the member list after an assignment
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await fetch("/api/users", { credentials: "include" });
        if (!res.ok) {
          setError("Could not load members");
          return;
        }
        setMembers(await res.json());
      } catch (err) {
        console.error("Failed to load members", err);
        setError("Something went wrong");
      }
    };
    loadMembers();
  }, [refreshSignal, reloadKey]);

  useEffect(() => {
    if (!user?.groupId) return;
    const loadGroup = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const group = await res.json();
          setDiscountTypes(group.discountTypes || []);
        }
      } catch (err) {
        console.error("Failed to load discount types", err);
      }
    };
    loadGroup();
  }, [user?.groupId, refreshSignal]);

  const discounted = members.filter((m) => m.discount);
  const assignable = members.filter((m) => m.role === "member");

  // open the modal blank (assign to anyone) or pre-filled for a clicked member
  const openAssign = (member) => {
    setMemberId(member ? member._id : "");
    setDiscountName(member?.discount?.name ?? "");
    setModalError("");
    setShowModal(true);
  };

  const save = async () => {
    if (!memberId) {
      setModalError("Pick a member first.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const body = discountName
        ? { discount: { name: discountName } }
        : { discount: null };
      const res = await fetch(`/api/users/${memberId}/discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.message ?? "Could not save.";
        setModalError(message);
        showToast(message, "danger");
        return;
      }
      setReloadKey((k) => k + 1); // refresh the member list
      if (onChange) onChange(); // let the dashboard refresh the dues total
      showToast("Successfully saved discount!");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save discount", err);
      showToast("Failed to save discount", "danger");
      setModalError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <WidgetCard
        title="Discounts"
        subtitle="Members on a reduced or waived rate"
        badge={discounted.length}
        footer={
          <div className="px-3 pb-3">
            <Button
              variant={null}
              className="btn-action-primary w-100"
              onClick={() => openAssign(null)}
            >
              Assign a Discount
            </Button>
          </div>
        }
      >
        <PreviewList
          columns={DISCOUNT_COLUMNS}
          items={discounted}
          total={discounted.length}
          emptyMessage={error || "No members are on a discount yet"}
          onSelect={openAssign}
          rowKey={(m) => m._id}
        />
      </WidgetCard>

      <Modal
        show={showModal}
        onHide={() => !saving && setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign a Discount</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="discount-member">
            <Form.Label>Member</Form.Label>
            <Form.Select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Select a member…</option>
              {assignable.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="discount-choice">
            <Form.Label>Discount</Form.Label>
            <Form.Select
              value={discountName}
              onChange={(e) => setDiscountName(e.target.value)}
            >
              <option value="">No discount (clear)</option>
              {discountTypes.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} (${d.amount})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {discountTypes.length === 0 && (
            <p className="text-secondary-muted small mt-2 mb-0">
              Define discount types first (the card to the left).
            </p>
          )}
          {modalError && (
            <p className="text-attention small mt-2 mb-0">{modalError}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={null}
            className="btn-action-secondary"
            onClick={() => setShowModal(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant={null}
            className="btn-action-primary"
            onClick={save}
            disabled={saving}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

DiscountsWidget.propTypes = {
  refreshSignal: PropTypes.number,
  onChange: PropTypes.func,
};
