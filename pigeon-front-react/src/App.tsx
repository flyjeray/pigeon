import { useSupabase, useAuth, usePrivateKey } from "./supabase/hooks";
import { useAuthActions } from "./hooks/useAuth";
import { useSupabaseTest } from "./hooks/useSupabaseTest";
import { Chat } from "./components/Chat";

function App() {
  const { loading } = useSupabase();
  const { user } = useAuth();
  const { privateKey } = usePrivateKey();
  const { signUp, signIn, signOut, status: authStatus } = useAuthActions();
  const {
    testSupabaseWrapper,
    status: testStatus,
    initialized,
  } = useSupabaseTest();

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signUp(email, password);
  };

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signIn(email, password);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return <div>Loading Supabase...</div>;
  }

  return (
    <>
      <h1>Pigeon</h1>
      <div>
        <h2>Supabase Wrapper Test</h2>
        <button onClick={testSupabaseWrapper}>Test Supabase Wrapper</button>
        <p>
          Status:{" "}
          {testStatus ||
            authStatus ||
            (initialized ? "Initialized" : "Not initialized")}
        </p>
        {user && (
          <div>
            <p>Logged in as: {user.email}</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
        {privateKey && (
          <p>
            Private Key Loaded: {privateKey.slice(0, 3)}...
            {privateKey.slice(-3)}
          </p>
        )}
      </div>
      <div>
        <h2>Authentication</h2>
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

        <Chat />
      </div>
    </>
  );
}

export default App;
