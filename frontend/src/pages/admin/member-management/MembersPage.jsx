import { Container, Row, Button, Modal } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext.jsx";
import WidgetCard from "../../../components/widget/WidgetCard.jsx";
import PreviewList from "../../../components/widget/PreviewList.jsx";
import Pager from "../../../components/widget/Pager.jsx";

const ROLES = ["member", "treasurer", "admin"];
const PAGE_SIZE = 15;

export default function MembersPage() {
  const { user } = useUser();
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // a role change awaiting confirmation: { id, name, currentRole, newRole }
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (!user?.groupId) return;
    let cancelled = false;
    const loadMembers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/users?page=${page}&pageSize=${PAGE_SIZE}`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setMembers(data.members);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to load club members", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [user?.groupId, page]);

  const changeRole = async (id, role) => {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return;
      setMembers((prev) =>
        prev.map((m) => (m._id === id ? { ...m, role } : m))
      );
    } catch (err) {
      console.error("Failed to update member role", err);
    }
  };

  // picking a new role stages it for confirmation instead of committing it.
  const requestRoleChange = (member, newRole) => {
    if (newRole === member.role) return;
    setPending({
      id: member._id,
      name: `${member.firstName} ${member.lastName}`,
      currentRole: member.role,
      newRole,
    });
  };

  const confirmChange = () => {
    if (pending) changeRole(pending.id, pending.newRole);
    setPending(null);
  };

  const columns = [
    { label: "Name", size: 2, render: (m) => `${m.firstName} ${m.lastName}` },
    { label: "Email", size: 3, render: (m) => m.email },
    { label: "Phone Number", size: 3, render: (m) => m.phoneNumber },
    { label: "DOB", size: 2, render: (m) => m.birthDate },
    {
      label: "Role",
      size: 2,
      render: (m) => (
        <Form.Select
          size="sm"
          aria-label={`Role for ${m.firstName} ${m.lastName}`}
          value={m.role}
          disabled={String(m._id) === String(user?.id)}
          onChange={(e) => requestRoleChange(m, e.target.value)}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Form.Select>
      ),
    },
  ];

  return (
    <Container className="px-5">
      <title>Club Members · ClubSync</title>
      <meta
        name="description"
        content="Admin only page where admins can view the total amount of members within the club. 
        They can view the role of each member, email, and name. They can also change the role of members here. 
        This is how people become treasurers in a club via admin promotion"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <h1 className="moto">Club Members</h1>
      <p className="lead-text spacing-after-moto">
        View all club Members here and assign treasurer or admin roles to
        members of your club
      </p>

      <Row className="justify-content-center gy-4">
        <WidgetCard title="Club Members" subtitle="Assign roles">
          {loading ? (
            <p className="inner-card-context small text-secondary-muted">
              Loading members…
            </p>
          ) : (
            <>
              <PreviewList
                columns={columns}
                items={members}
                total={members.length}
                emptyMessage="No members have joined your club yet."
                rowKey={(m) => m._id}
              />
              <Pager
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </>
          )}
        </WidgetCard>
      </Row>

      <Modal show={!!pending} onHide={() => setPending(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change role?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pending && (
            <p className="mb-0">
              Change <strong>{pending.name}</strong>&apos;s role from{" "}
              <strong>{pending.currentRole}</strong> to{" "}
              <strong>{pending.newRole}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={null}
            className="btn-action-secondary"
            onClick={() => setPending(null)}
          >
            Cancel
          </Button>
          <Button
            variant={null}
            className="btn-action-primary"
            onClick={confirmChange}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
