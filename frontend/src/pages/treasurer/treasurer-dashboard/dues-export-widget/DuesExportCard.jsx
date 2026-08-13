import { useState } from "react";
import { Card, Button, Col } from "react-bootstrap";

const CSV_HEADERS = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Role",
  "Dues Status",
  "Tier",
  "Amount",
  "Discount",
];

// wrap every field in quotes and escape embedded quotes, so commas/quotes in
// names or emails can't break the columns.
const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const toCsv = (members) => {
  const rows = members.map((m) => [
    m.firstName,
    m.lastName,
    m.email,
    m.phoneNumber,
    m.role,
    m.duesStatus,
    m.duesTier === "null" ? "" : m.duesTier,
    // effective amount owed: a discount overrides the tier price
    m.discount ? m.discount.amount : (m.duesAmount ?? ""),
    m.discount ? `${m.discount.name} ($${m.discount.amount})` : "",
  ]);
  return [CSV_HEADERS, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
};

// Lets a treasurer download every member's payment status as a CSV for the
// school / their own records. Fetches on click so there's no extra load.
export default function DuesExportCard() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) {
        setError("Could not load members.");
        return;
      }
      const members = await res.json();

      const csv = toCsv(members);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "clubsync-payment-status.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Col xs={12} md={5} lg={4} className="role-card dues-stat-widget">
      <Card className="h-100 dues-card d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>Export</Card.Title>
          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            Payment Status (CSV)
          </Card.Subtitle>

          <Card className="dues-inner-card mt-auto">
            <Card.Body className="p-3">
              <div className="inner-card-context small text-secondary-muted">
                Download every member&apos;s dues status, tier, amount, and
                discount as a spreadsheet for your records or the school.
              </div>
            </Card.Body>
          </Card>

          <Button
            variant={null}
            className="btn-action-primary mt-3"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Preparing…" : "Export CSV"}
          </Button>
          {error && <p className="text-attention small mt-2 mb-0">{error}</p>}
        </Card.Body>
      </Card>
    </Col>
  );
}
