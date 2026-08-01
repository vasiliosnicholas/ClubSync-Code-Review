import { Link, useNavigate } from "react-router";
import AuthForm from "../AuthForm.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
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
  );
}
