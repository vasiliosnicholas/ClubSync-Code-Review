import { Link, useNavigate } from "react-router";
import AuthForm from "../AuthForm.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <>
      <title>Register · ClubSync</title>
      <meta
        name="description"
        content="basic register page where a user will fill out account information and also the type of role they want. 
        Either you are a member joining a club or an admin creating one. Other roles for existing clubs must 
        be granted by an established admin"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <AuthForm
        heading="Register"
        endpoint="/api/auth/register"
        submitLabel="Register"
        errorFallback="Registration failed"
        fields={[
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            placeholder: "Enter your first name",
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            placeholder: "Enter your last name",
          },
          {
            name: "email",
            label: "Email address",
            type: "email",
            placeholder: "Enter email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Password",
          },
          {
            name: "role",
            label: "I am registering as",
            type: "select",
            defaultValue: "member",
            options: [
              { value: "member", label: "Member" },
              { value: "admin", label: "Admin (create a club)" },
            ],
          },
          {
            name: "clubName",
            label: "Club name (admins only)",
            type: "text",
            placeholder: "Name your club",
          },
        ]}
        onSuccess={() => navigate("/login")}
      >
        <div>
          Do you have an account? <Link to="/login">Login Here</Link>
        </div>
      </AuthForm>
    </>
  );
}
