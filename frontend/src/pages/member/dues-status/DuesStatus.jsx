import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useUser } from "../../../context/UserContext.jsx";
import WarningIcon from "../../../components/icons/WarningIcon.jsx";
import DuesClarity from "./DuesClarity.jsx";

// only these two states allow a (re)submission. anyone already pending/approved
// shouldn't be able to submit again.
const SUBMITTABLE = ["not_submitted", "denied"];

// a payment reference must match the pattern for its method (mirrors the
// server's validation) so members can't submit junk like "asdf".
const PAYMENT_PATTERNS = {
  venmo: {
    regex: /^\d{6,25}$/,
    placeholder: "Venmo transaction / confirmation number",
    hint: "Enter the 6–25 digit number from your Venmo receipt.",
  },
  check: {
    regex: /^\d{1,6}$/,
    placeholder: "Check number",
    hint: "Enter your 1–6 digit check number.",
  },
};

export default function DuesStatus() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [tier, setTier] = useState("gold");
  const [paymentMethod, setPaymentMethod] = useState("venmo");
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState("");
  const [latest, setLatest] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [duesAmounts, setDuesAmounts] = useState(null);

  const canSubmit = SUBMITTABLE.includes(user?.duesStatus || "not_submitted");

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const res = await fetch("/api/dues/mine", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setLatest(data.submission);
      } catch (err) {
        console.error("Failed to load your dues submission", err);
      }
    };
    loadLatest();
  }, []);

  useEffect(() => {
    if (!user?.groupId) return;
    const loadClub = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setDuesAmounts(data.duesAmounts ?? null);
      } catch (err) {
        console.error("Failed to load your club's dues prices", err);
      }
    };
    loadClub();
  }, [user?.groupId]);

  // withdraws a still pending submission so the member can start over. Resets
  // context back to not_submitted, which shows the submission form again
  const handleWithdraw = async () => {
    if (!latest?.submissionId) return;
    setWithdrawing(true);
    setError("");
    try {
      const res = await fetch(`/api/dues/${latest.submissionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not withdraw your submission.");
        return;
      }
      setLatest(null);
      setUser({ ...user, duesStatus: "not_submitted" });
    } catch (err) {
      console.error("Withdraw dues request failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // instant client-side check; the server re-validates the same pattern.
    const rule = PAYMENT_PATTERNS[paymentMethod];
    if (!rule.regex.test(paymentReference.trim())) {
      setError(rule.hint);
      return;
    }

    try {
      const res = await fetch("/api/dues/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tier,
          paymentMethod,
          paymentReference: paymentReference.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not submit your dues.");
        return;
      }

      const data = await res.json();

      setUser({
        ...user,
        duesStatus: data.duesStatus,
        duesTier: tier,
        duesAmount: data.amount,
      });
      navigate("/member/member-dashboard");
    } catch (err) {
      console.error("Submit dues request failed", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="dues-status px-5">
      <title>Dues · ClubSync</title>
      <meta
        name="description"
        content="Dues page for members to view the status of their dues. If they have not submitted their dues for the club, then they can submit them here. 
        They can revoke submissions and also view the status of their submission after a treasurer has looked it over"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <h1 className="moto">Submit Your Dues</h1>

      {user?.duesStatus === "denied" && latest?.reviewNote && (
        <Alert
          variant={null}
          className="alert-action-attention spacing-after-moto"
        >
          <Alert.Heading className="h6">
            Your last submission was denied
          </Alert.Heading>
          <p className="mb-0">{latest.reviewNote}</p>
        </Alert>
      )}

      {user?.groupId === null ? (
        <Alert
          variant={null}
          className="alert-action-attention spacing-after-moto"
        >
          <Alert.Heading className="h6">
            You must join a group on the dashboard before submitting dues
          </Alert.Heading>
          <p className="mb-0">{latest?.reviewNote}</p>
        </Alert>
      ) : !canSubmit ? (
        <div className="spacing-after-moto">
          <p>
            Your dues are already{" "}
            <strong>{(user?.duesStatus || "").replace("_", " ")}</strong>. There
            is nothing to submit right now.
          </p>
          {user?.duesStatus === "pending" && (
            <>
              <Button
                variant={null}
                className="btn-action-danger"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                <WarningIcon />
                Withdraw Submission
              </Button>
              {error && <div className="text-attention mt-3">{error}</div>}
            </>
          )}
        </div>
      ) : (
        <>
        <h2 className="text-center mt-5">Why Submit Dues?</h2>
        <DuesClarity />
        <Form
          onSubmit={handleSubmit}
          className="mt-3 spacing-after-moto auth-form"
        >
          <Form.Group className="mb-5" controlId="dues-tier">
            <Form.Label>Membership tier</Form.Label>
            <Form.Select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="gold">
                Gold{duesAmounts?.gold != null ? ` — $${duesAmounts.gold}` : ""}
              </option>
              <option value="silver">
                Silver
                {duesAmounts?.silver != null ? ` — $${duesAmounts.silver}` : ""}
              </option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="dues-payment-method">
            <Form.Label>Payment method</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="venmo">Venmo</option>
              <option value="check">Check</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="dues-payment-reference">
            <Form.Label>Payment reference</Form.Label>
            <Form.Control
              type="text"
              placeholder={PAYMENT_PATTERNS[paymentMethod].placeholder}
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
            <Form.Text className="text-secondary-muted">
              {PAYMENT_PATTERNS[paymentMethod].hint} Helps your treasurer match
              your payment when verifying.
            </Form.Text>
          </Form.Group>
          {error && <div className="text-attention mb-3">{error}</div>}
          <div className="auth-form-submit">
            <Button variant={null} className="btn-action-primary" type="submit">
              Submit Dues
            </Button>
          </div>
        </Form>
        </>
      )}
    </div>
  );
}
