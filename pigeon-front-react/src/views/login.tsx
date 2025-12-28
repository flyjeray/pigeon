import {
  CenteredPage,
  Input,
  Container,
  Button,
  HorizontalDivider,
} from "../components";
import { useAuthActions } from "../hooks/useAuthActions";

export const LoginView = () => {
  const { signIn, error, isLoading } = useAuthActions();

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signIn({ email, password });
  };

  return (
    <CenteredPage>
      <h1>Pigeon</h1>
      <Container isForm onSubmit={onSignIn}>
        <Input name="email" type="email" placeholder="Email" required />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <HorizontalDivider />
        <Button type="submit" disabled={isLoading}>
          Sign In
        </Button>
        {error && (
          <p style={{ color: "red", textAlign: "center", width: "100%" }}>
            {error}
          </p>
        )}
      </Container>
      <p>
        Not registered yet? <a href="/register">Register here</a>
      </p>
    </CenteredPage>
  );
};
