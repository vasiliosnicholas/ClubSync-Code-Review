import { useNavigate } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";
import { useToast } from "../../../context/ToastContext.jsx";
import AuthForm from "../AuthForm.jsx";

const ROLE_HOME = {
  member: "/member/member-dashboard",
  treasurer: "/treasurer/treasurer-dashboard",
  admin: "/admin/admin-dashboard",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { showToast } = useToast();

  return (
    <>
      <title>Log In · ClubSync</title>
      <meta
        name="description"
        content="basic login page for club sync that will grant a successfully logged in user a 
        24-hr session token into their account with their existing privledges"
      />
      <meta name="author" content="Sean Behan, Julian Leonhardt" />
      <AuthForm
        heading="Log in to ClubSync"
        endpoint="/api/auth/login"
        submitLabel="Login"
        errorFallback="Invalid credentials"
        fields={[
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
        ]}
        onSuccess={(data) => {
          setUser(data.user);
          showToast(`Logged in successfully! Welcome ${data.user.firstName}`);
          navigate(ROLE_HOME[data.user.role] ?? "/");
        }}
        redirectQuestion="Don't have account? Create one"
        redirectLink="/register"
        redirectText="here"
      />
    </>
  );
}
