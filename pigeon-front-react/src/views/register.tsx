import {
  Button,
  CenteredPage,
  Container,
  HorizontalDivider,
  Input,
} from "../components";
import { useAuthActions } from "../hooks/useAuthActions";

export const RegisterView = () => {
  const { signUp, error } = useAuthActions();

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signUp({ email, password });
  };

  return (
    <CenteredPage>
      <h1>Pigeon</h1>

      <form onSubmit={onSignUp}>
        <Container>
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
      </form>

      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </CenteredPage>
  );
};
