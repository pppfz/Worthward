import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { hasAdmin } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await hasAdmin()) {
    redirect("/login");
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <span className="brand-mark">前</span>
        <p className="eyebrow">FIRST SETUP</p>
        <h1>给脑海里的事，留一个不着急的位置。</h1>
        <p>
          这是唯一一次初始化。账号创建后，公开注册会自动关闭，并为你建立彼此隔离的工作与个人空间。
        </p>
      </section>
      <section className="auth-panel">
        <div>
          <p className="eyebrow">创建管理员</p>
          <h2>开始使用前台</h2>
        </div>
        <AuthForm mode="setup" />
      </section>
    </main>
  );
}
