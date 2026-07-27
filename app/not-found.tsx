import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span className="brand-mark">前</span>
      <h1>这里没有需要处理的内容。</h1>
      <p>可能是地址写错了，也可能这条路还没有被建立。</p>
      <Link className="primary-button" href="/">
        回到首页
      </Link>
    </main>
  );
}
