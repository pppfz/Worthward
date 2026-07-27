import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

type AppHeaderProps = {
  userName: string;
  backHref?: string;
};

export function AppHeader({ userName, backHref }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="header-left">
          {backHref ? (
            <Link className="back-link" href={backHref}>
              ← 返回
            </Link>
          ) : null}
          <Link className="wordmark" href="/home">
            前台
          </Link>
        </div>
        <div className="header-account">
          <span>{userName}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
