import { Button } from "antd";
import { signIn } from "@/auth";

export default function Home() {
  return (
    <div>
      <form
        action={async () => {
          "use server";
          await signIn();
        }}
      >
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
