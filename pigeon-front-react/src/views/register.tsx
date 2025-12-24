import { Navigate } from "react-router";
import {
  Button,
  CenteredPage,
  Container,
  HorizontalDivider,
  Input,
} from "../components";
import { useSupabase } from "../supabase/hooks";

export const RegisterView = () => {
  const { wrapper, user } = useSupabase();

  if (user) {
    return <Navigate to="/" />;
  }

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!wrapper) return;
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await wrapper.auth.signUp(email, password);
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
        </Container>
      </form>

      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </CenteredPage>
  );
};
