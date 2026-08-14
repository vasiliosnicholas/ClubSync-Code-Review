import { OverlayTrigger, Tooltip } from "react-bootstrap";
import PropTypes from "prop-types";

// A small ⓘ icon that reveals a tooltip explaining the tier system. The wording
// is passed in via `text` so each page can give context-appropriate help.
// Accessible: the trigger is a real <button> with an aria-label, and
// OverlayTrigger opens on focus as well as hover (so it works with a keyboard).
export default function TierInfo({ text, label = "About the tier system" }) {
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip>{text}</Tooltip>}>
      <button
        type="button"
        aria-label={label}
        style={{
          background: "none",
          border: "none",
          padding: "0 0.35rem",
          cursor: "help",
          color: "var(--color-gold-interactive)",
          fontSize: "0.95em",
          lineHeight: 1,
        }}
      >
        <span aria-hidden="true">ⓘ</span>
      </button>
    </OverlayTrigger>
  );
}

TierInfo.propTypes = {
  text: PropTypes.string.isRequired,
  label: PropTypes.string,
};
