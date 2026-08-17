import { useContext, createContext } from "react";

// The context now carries both the user and a setter so components (login,
// logout) can update the logged-in user without a full page reload.
export const UserContext = createContext({ user: null, setUser: () => {} }); //nice use of createContext & useContext!
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContext.Provider");
  }
  return context;
};
