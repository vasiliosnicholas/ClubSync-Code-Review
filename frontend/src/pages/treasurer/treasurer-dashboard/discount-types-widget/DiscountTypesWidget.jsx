import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Button, Col, Modal, Form } from "react-bootstrap";
import { useUser } from "../../../../context/UserContext.jsx";

// Lets a treasurer define the club's named discounts ({name, amount}). These are
// the options that can later be assigned to individual members (see #6b).
export default function DiscountTypesWidget({ refreshSignal, onChange }) {
  const { user } = useUser();
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState([]); // editable copy while the modal is open
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.groupId) return;
    const loadTypes = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const group = await res.json();
        setTypes(group.discountTypes || []);
      } catch (err) {
        console.error("Failed to load discount types", err);
      }
    };
    loadTypes();
  }, [user?.groupId, refreshSignal]);

  const openEdit = () => {
    setDraft(types.map((t) => ({ ...t })));
    setError("");
    setShowModal(true);
  };
  const addRow = () => setDraft((d) => [...d, { name: "", amount: 0 }]);
  const removeRow = (i) => setDraft((d) => d.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) =>
    setDraft((d) => d.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const save = async () => {
    const clean = draft
      .map((d) => ({ name: d.name.trim(), amount: Number(d.amount) }))
      .filter((d) => d.name !== "" && Number.isFinite(d.amount) && d.amount >= 0);

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/groups/discount-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ discountTypes: clean }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Could not save discounts.");
        return;
      }
      const group = await res.json();
      setTypes(group.discountTypes || []);
      if (onChange) onChange(); // let sibling widgets pick up the new types
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save discount types", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Col xs={12} md={5} lg={4} className="role-card dues-stat-widget">
      <Card className="h-100 dues-card d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>Discount Types</Card.Title>
          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            Named discounts you can assign
          </Card.Subtitle>

          <Card className="dues-inner-card mt-auto">
            <Card.Body className="p-3">
              {types.length === 0 ? (
                <div className="inner-card-context small text-secondary-muted">
                  No discount types yet — add some to start giving members a
                  reduced or waived rate.
                </div>
              ) : (
                types.map((t) => (
                  <div
                    key={t.name}
                    className="d-flex justify-content-between align-items-center small py-1"
                  >
                    <span>{t.name}</span>
                    <span className="text-secondary-muted">${t.amount}</span>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          <Button
            variant={null}
            className="btn-action-primary mt-3"
            onClick={openEdit}
          >
            Edit Discounts
          </Button>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => !saving && setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Discount Types</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-secondary-muted small">
            Define the named discounts your club offers. Each has a name and the
            amount the member pays ($0 = full waiver).
          </p>
          {draft.map((row, i) => (
            <div key={i} className="d-flex gap-2 mb-2 align-items-end">
              <Form.Group className="flex-grow-1">
                <Form.Label className="small mb-1">Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Scholarship"
                  value={row.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                />
              </Form.Group>
              <Form.Group style={{ width: "110px" }}>
                <Form.Label className="small mb-1">Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.amount}
                  onChange={(e) => updateRow(i, "amount", e.target.value)}
                />
              </Form.Group>
              <Button
                variant={null}
                className="btn-action-danger"
                onClick={() => removeRow(i)}
                aria-label="Remove discount"
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            variant={null}
            className="btn-action-secondary"
            onClick={addRow}
          >
            + Add discount
          </Button>
          {error && <p className="text-attention small mt-2 mb-0">{error}</p>}
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
            Save Discounts
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );
}

DiscountTypesWidget.propTypes = {
  refreshSignal: PropTypes.number,
  onChange: PropTypes.func,
};
