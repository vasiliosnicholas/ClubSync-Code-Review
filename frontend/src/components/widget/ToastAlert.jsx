import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import CloseButton from "react-bootstrap/CloseButton";
import PropTypes from "prop-types";

export default function ToastAlert({ show, onClose, message, variant = "success" }) {
  const isLight = variant === "light";

  return (
    // role/aria-live make this a persistent live region so screen readers
    // announce toasts as they appear (polite = wait for a pause in speech).
    <ToastContainer
      className="p-3"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: "15%",
        right: 0,
        transform: "translateY(-50%)",
        zIndex: 1070,
      }}
    >
      <Toast show={show} onClose={onClose} autohide delay={6000} bg={variant}>
        <Toast.Body
          className={`d-flex align-items-start justify-content-between ${isLight ? "" : "text-white"}`}
        >
          <div>{message}</div>
          <CloseButton
            variant={isLight ? undefined : "white"}
            onClick={onClose}
            className="ms-2"
          />
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

ToastAlert.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string,
  variant: PropTypes.string,
};
