import { Row, Container } from "react-bootstrap";
import RoleCard from "../../homepage/RoleCard";

const BENEFITS = [
  {
    title: "In the Loop",
    text: "Once your dues are approved, you'll always know exactly where you stand — no wondering if your payment went through.",
  },
  {
    title: "RSVP to Events",
    text: "Approved dues unlock RSVPs to tier-gated events instantly — no waiting on a treasurer to update a spreadsheet.",
  },
  {
    title: "Clarity All Around",
    text: "Your tier is tied to your account, so eligibility is automatic — you'll never get turned away at an event you should qualify for.",
  },
];

export default function DuesClarity() {
  return (
    <Container className="px-5">
      <Row className="justify-content-center gx-3">
        {BENEFITS.map((role) => (
          <RoleCard key={role.title} title={role.title} text={role.text} />
        ))}
      </Row>
    </Container>
  );
}
