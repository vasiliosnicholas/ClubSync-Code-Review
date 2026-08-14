import { useNavigate } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";
import { useToast } from "../../../context/ToastContext.jsx";
import AuthForm from "../AuthForm.jsx";

const ROLE_HOME = {
  member: "/member/member-dashboard",
  treasurer: "/treasurer/treasurer-dashboard",
  admin: "/admin/admin-dashboard",
};

export default function RegisterMemberPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { showToast } = useToast();

  return (
    <>
      <title>Register as a Member · ClubSync</title>
      <meta
        name="description"
        content="register page for a new member account. After registering, use a club's join code from the member dashboard to join it."
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <AuthForm
        heading="Register as a Member"
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
            name: "birthDate",
            label: "Date of Birth",
            type: "date",
            placeholder: "Enter your date of birth",
          },
          {
            name: "email",
            label: "Email address",
            type: "email",
            placeholder: "Enter email",
          },
          {
            name: "phoneNumber",
            label: "Phone number",
            type: "tel",
            placeholder: "Enter phone number",
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
        ]}
        onSuccess={(data) => {
          setUser(data.user);
          showToast(`Registered ${data.user.firstName} successfully!`);
          navigate(ROLE_HOME[data.user.role] ?? "/");
        }}
        redirectQuestion="Already have an account?"
        redirectLink="/login"
        redirectText="Log in here"
      />
    </>
  );
}
