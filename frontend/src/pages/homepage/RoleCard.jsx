import { Col } from "react-bootstrap";
import PropTypes from "prop-types";

export default function RoleCard({ title, text, img, imgWebp, imgAlt }) {
  return (
    <Col xs={12} md={4} className="role-card">
      <h3 className="role-title">{title}</h3>
      {img && (
        <picture>
          {imgWebp && <source srcSet={imgWebp} type="image/webp" />}
          <img
            src={img}
            width="640"
            height="428"
            fetchPriority="high"
            alt={imgAlt}
            className="register-img"
          />
        </picture>
      )}
      <p className="lead-text">{text}</p>
    </Col>
  );
}

RoleCard.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  img: PropTypes.string,
  imgWebp: PropTypes.string,
  imgAlt: PropTypes.string,
};
