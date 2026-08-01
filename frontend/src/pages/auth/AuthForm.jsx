import { useState } from "react";
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
}) {
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = Object.fromEntries(new FormData(e.target));

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
      <Form onSubmit={handleSubmit} className="spacing-after-moto">
        {fields.map((field) => (
          <Form.Group className="mb-3" key={field.name}>
            <Form.Label>{field.label}</Form.Label>
            {field.type === "select" ? (
              <Form.Select name={field.name} defaultValue={field.defaultValue}>
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
              />
            )}
          </Form.Group>
        ))}

        {error && <div className="text-attention mb-3">{error}</div>}

        <div>
          <Button
            className="me-2 btn-action-primary"
            variant={null}
            type="submit"
          >
            {submitLabel}
          </Button>
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
};
