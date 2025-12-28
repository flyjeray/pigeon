import { useState } from "react";
import {
  Button,
  CenteredPage,
  Container,
  HorizontalDivider,
  Input,
} from "../components";
import { useAuthActions } from "../hooks/useAuthActions";

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
    await signUp({ email, password });
  };

  if (success) {
    return (
      <CenteredPage>
        <h1>Registration Successful!</h1>
        <p>Please check your email to verify your account before logging in.</p>
        <p>
          <a href="/login">Go to Login</a>
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
        <HorizontalDivider />
        <Button type="submit">Sign Up</Button>
        {error && (
          <p style={{ color: "red", textAlign: "center", width: "100%" }}>
            {error}
          </p>
        )}
      </Container>

      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </CenteredPage>
  );
};
