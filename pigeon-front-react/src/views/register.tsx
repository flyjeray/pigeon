import { useState } from "react";
import {
  Button,
  CenteredPage,
  Container,
  HorizontalDivider,
  Input,
} from "../components";
import { useAuthActions } from "../hooks/useAuthActions";
import { Link } from "react-router";

export const RegisterView = () => {
  const [success, setSuccess] = useState(false);
  const { signUp, error } = useAuthActions({
    onSignupSuccess: () => setSuccess(true),
  });

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    if (password !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    await signUp({ email, password });
  };

  if (success) {
    return (
      <CenteredPage>
        <h1>Registration Successful!</h1>
        <p>Please check your email to verify your account before logging in.</p>
        <p>
          <Link to="/login">Go to Login</Link>
        </p>
      </CenteredPage>
    );
  }

  return (
    <CenteredPage>
      <h1>Pigeon</h1>

      <Container isForm onSubmit={onSignUp}>
        <Input name="email" type="email" placeholder="Email" required />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <Input
          name="password_confirm"
          type="password"
          placeholder="Confirm Password"
          required
        />
        <HorizontalDivider />
        <Button type="submit">Sign Up</Button>
        {error && (
          <p style={{ color: "red", textAlign: "center", width: "100%" }}>
            {error}
          </p>
        )}
      </Container>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </CenteredPage>
  );
};
