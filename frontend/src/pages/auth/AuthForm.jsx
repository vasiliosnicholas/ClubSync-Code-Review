import { useState } from "react";
import { Link } from "react-router";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import PropTypes from "prop-types";

// this component owns the error state and the submit/fetch/error boilerplate.
export default function AuthForm({
  heading,
  fields,
  endpoint,
  submitLabel,
  errorFallback,
  onSuccess,
  children,
  redirectQuestion,
  redirectLink,
  redirectText,
  isAdmin,
}) {
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = Object.fromEntries(new FormData(e.target));
    if (isAdmin) {
      payload.role = "admin";
    }

    // client-side only: confirm the two password fields match, then drop the
    // confirm value so it never reaches the server. Login has no confirm field,
    // so the guard skips this entirely there.
    if (payload.confirmPassword !== undefined) {
      if (payload.password !== payload.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      delete payload.confirmPassword;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || errorFallback);
        return;
      }

      const data = await res.json();
      onSuccess(data);
    } catch (err) {
      console.error(`${endpoint} request failed`, err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <h1 className="moto">{heading}</h1>
      <Form onSubmit={handleSubmit} className="spacing-after-moto auth-form">
        {fields.map((field) => (
          <Form.Group className="mb-5" key={field.name} controlId={field.name}>
            <Form.Label>
              {field.label}{" "}
              <span className="text-attention" aria-hidden="true">
                *
              </span>
            </Form.Label>
            {field.type === "select" ? (
              <Form.Select
                name={field.name}
                defaultValue={field.defaultValue}
                required
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type={field.type}
                placeholder={field.placeholder}
                name={field.name}
                required
              />
            )}
          </Form.Group>
        ))}

        <p className="mb-3">
          <span className="text-attention" aria-hidden="true">
            *
          </span>{" "}
          indicates a required field
        </p>

        {error && <div className="text-attention mb-3">{error}</div>}

        <div className="auth-form-submit">
          <Button
            className="me-2 btn-action-primary"
            variant={null}
            type="submit"
          >
            {submitLabel}
          </Button>
          <span className="w-50 d-inline-block">{redirectQuestion} <Link to={redirectLink}>{redirectText}</Link></span>
        </div>

        {children}
      </Form>
    </>
  );
}

AuthForm.propTypes = {
  heading: PropTypes.string,
  fields: PropTypes.array,
  endpoint: PropTypes.string.isRequired,
  submitLabel: PropTypes.string,
  errorFallback: PropTypes.string,
  onSuccess: PropTypes.func,
  children: PropTypes.node,
  redirectQuestion: PropTypes.string,
  redirectLink: PropTypes.string,
  redirectText: PropTypes.string,
  isAdmin: PropTypes.bool,
};
