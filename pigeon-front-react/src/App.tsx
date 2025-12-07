import { useState } from "react";
import { useSupabase, useAuth, usePrivateKey } from "./supabase/hooks";
import { Chat } from "./components/Chat";

function App() {
  const [status, setStatus] = useState<string>("");
  const { wrapper, initialized, loading } = useSupabase();
  const { user } = useAuth();
  const { privateKey } = usePrivateKey();

  const testSupabaseWrapper = () => {
    if (!wrapper) {
      setStatus("Supabase not initialized");
      return;
    }
    setStatus("SupabaseWrapper accessed successfully!");
    console.log("Supabase client:", wrapper.getClient());
  };

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!wrapper) return;
    const { data, error } = await wrapper.auth.signUp(email, password);
    if (error) {
      setStatus(`Sign Up Error: ${error.message}`);
    } else {
      setStatus(`Sign Up Success: ${data.user?.email}`);
    }
  };

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!wrapper) return;
    const { data, error } = await wrapper.auth.signIn(email, password);
    if (error) {
      setStatus(`Sign In Error: ${error.message}`);
    } else {
      setStatus(`Sign In Success: ${data.user?.email}`);
    }
  };

  const handleSignOut = async () => {
    if (!wrapper) return;
    const { error } = await wrapper.auth.signOut();
    if (error) {
      setStatus(`Sign Out Error: ${error.message}`);
    } else {
      setStatus("Signed out successfully");
    }
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
          Status: {status || (initialized ? "Initialized" : "Not initialized")}
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
