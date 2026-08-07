import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router";
import RoleCard from "../../homepage/RoleCard";
import memberRegisterImage from "../../../assets/member-register-image.jpg"
import memberRegisterImageWebp from "../../../assets/member-register-image.webp"
import adminImage from "../../../assets/admin-image.jpg"
import adminImageWebp from "../../../assets/admin-image.webp"

const USER_TYPES = [
  {
    title: "Sign Up as a Member",
    sbmtBtnTxt: "I am a Member",
    text: "The most basic tier for joining a club. As a member, you can join an existing club with a join code, submit dues, and RSVP to the events you qualify for. No spreadsheets, no chasing down forms.",
    link: "/register/member",
    img: memberRegisterImage,
    imgWebp: memberRegisterImageWebp,
    imgAlt: "Group of members of a club laughing and having a good time with each other. They are spending time at a club event organized by ClubSync."
  },
  {
    title: "Sign up as an Admin",
    sbmtBtnTxt: "I am an Admin",
    text: "The highest tier in ClubSync. Signing up as an admin creates a brand-new club from scratch, with treasurer and member privileges included. Share the join code, then promote members to admin or treasurer.",
    link: "/register/admin",
    img: adminImage,
    imgWebp: adminImageWebp,
    imgAlt: "Admin role user on club sync organizing his new club after registration."
  },
];

export default function RegisterLandingPage() {
  return (
    <>
      <title>User Type · ClubSync</title>
      <meta
        name="description"
        content="user type landing page that clarifies to a user what type of account they may want. 
        You can either select a member to join an exisiting club. If you want to be a treasurer or an admin for an exisiting club, 
        you must join as a member and the admin of that club will promote you. You cannot sign up as a treasurer or admin for an EXISTING club.
        If you want to create a new club, you will become an admin of that club"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <h1 className="moto">Registered User Type</h1>
      <p className="lead-text spacing-after-moto">
      </p>
      <Row className="justify-content-center gx-3">
        {USER_TYPES.map((role) => (
          <RoleCard key={role.title} img={role.img} imgWebp={role.imgWebp} imgAlt={role.imgAlt} title={role.title} text={role.text} />
          
        ))}
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} md={8} className="text-center">
          <p className="lead-text fw-bold">
            Want to become a treasurer or admin of an existing club? Join as a
            member first — that club&apos;s admin can promote you afterward.
          </p>
        </Col>
      </Row>
      <Row className="justify-content-center gx-3 mt-3">
        {USER_TYPES.map((role) => (
          <Col key={role.title} xs={12} md={4} className="text-center">
            <Button as={Link} to={role.link} className="btn-action-primary">
              {role.sbmtBtnTxt}
            </Button>
          </Col>
        ))}
      </Row>
    </>
  );
}
