import { Navigate } from "react-router";
import { useSupabase } from "../supabase/hooks";

export const LoginView = () => {
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

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!wrapper) return;
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await wrapper.auth.signIn(email, password);
  };

  return (
    <div>
      <h1>Pigeon</h1>

      <form onSubmit={onSignUp} style={{ border: "1px solid red" }}>
        <input name="email" type="email" placeholder="Email" required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <form onSubmit={onSignIn} style={{ border: "1px solid blue" }}>
        <input name="email" type="email" placeholder="Email" required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};
