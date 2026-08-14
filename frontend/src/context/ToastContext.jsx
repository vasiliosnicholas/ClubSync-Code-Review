import { useContext, createContext } from "react";

export const ToastContext = createContext({ showToast: () => {} });
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastContext.Provider");
  }
  return context;
};
