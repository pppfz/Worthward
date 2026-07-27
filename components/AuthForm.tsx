"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "setup" | "login";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const result =
        mode === "setup"
          ? await authClient.signUp.email({
              name: name.trim(),
              email: email.trim(),
              password,
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
            });

      if (result.error) {
        setError(
          mode === "setup"
            ? "初始化没有完成，请检查输入或确认系统尚未创建账号。"
            : "邮箱或密码不正确。",
        );
        return;
      }

      router.push("/home");
      router.refresh();
    } catch {
      setError("暂时无法连接服务，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === "setup" ? (
        <label className="field">
          <span>你的称呼</span>
          <input
            autoComplete="name"
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：小付"
            required
            value={name}
          />
        </label>
      ) : null}

      <label className="field">
        <span>邮箱</span>
        <input
          autoComplete="email"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        <span>密码</span>
        <input
          autoComplete={mode === "setup" ? "new-password" : "current-password"}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="至少 8 位"
          required
          type="password"
          value={password}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-button full-button" disabled={pending}>
        {pending
          ? "请稍候…"
          : mode === "setup"
            ? "创建我的空间"
            : "进入前台"}
      </button>
    </form>
  );
}
