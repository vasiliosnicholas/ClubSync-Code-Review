import { Container } from "react-bootstrap";
import DuesVerificationWidget from "../treasurer-dashboard/dues-verification-widget/DuesVerificationWidget";
import DuesExportCard from "../treasurer-dashboard/dues-export-widget/DuesExportCard";

export default function ReviewDues() {
  return (
    <Container className="px-5">
      <title>Dues Review · ClubSync</title>
      <meta
        name="description"
        content="Treasurer only page that will allow the treasurer to view all the dues submissions for a club. 
        They can see all the details of the submission like name, dues tier, and payment referance. 
        They can choose to approve the submission or deny it with a message as to why which the member will be able to see."
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <h1 className="moto">Review Dues Submission</h1>
      <p className="lead-text spacing-after-moto">
        Review all dues submissions from members of your club
      </p>

      <DuesVerificationWidget />
      <DuesExportCard />
    </Container>
  );
}
