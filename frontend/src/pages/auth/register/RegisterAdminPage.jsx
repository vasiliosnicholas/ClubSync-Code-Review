import { useNavigate } from "react-router";
import AuthForm from "../AuthForm.jsx";

export default function RegisterAdminPage() {
  const navigate = useNavigate();

  return (
    <>
      <title>Register as an Admin · ClubSync</title>
      <meta
        name="description"
        content="register page for a new admin account. Registering as an admin creates a brand-new club."
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <AuthForm
        heading="Register as an Admin"
        endpoint="/api/auth/register"
        submitLabel="Register"
        errorFallback="Registration failed"
        isAdmin
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
            name: "confirmPassword",
            label: "Confirm password",
            type: "password",
            placeholder: "Re-enter password",
          },
          {
            name: "clubName",
            label: "Club name",
            type: "text",
            placeholder: "Name your club",
          },
        ]}
        onSuccess={() => navigate("/login")}
        redirectQuestion="Already have an account?"
        redirectLink="/login"
        redirectText="Log in here"
      />
    </>
  );
}
