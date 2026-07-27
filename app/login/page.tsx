import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { hasAdmin } from "@/server/auth";
import { getSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!(await hasAdmin())) {
    redirect("/setup");
  }

  if (await getSession()) {
    redirect("/home");
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <span className="brand-mark">前</span>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>先回来看看，不需要立刻解决什么。</h1>
        <p>工作与个人彼此隔离。你只会看到此刻主动进入的那个空间。</p>
      </section>
      <section className="auth-panel">
        <div>
          <p className="eyebrow">登录</p>
          <h2>回到你的前台</h2>
        </div>
        <AuthForm mode="login" />
      </section>
    </main>
  );
}
