# Worthward

Hold every thought. Move what matters forward.

一个安静承接想法、隔离工作与个人内容的自托管记录工具。

## v0.1 已实现

- 首次创建唯一管理员；
- 邮箱密码登录；
- 工作与个人两个独立空间；
- 首页快速记录；
- 空间内快速记录；
- 待整理收件箱；
- 日记时间流；
- 收入日记、放回收件箱与软删除；
- 响应式手机与桌面界面；
- PostgreSQL、Drizzle 和 Docker Compose。

本版本不包含 AI、目标管理和 Web Push。

## 本地开发

需要 Node.js 22+ 与 PostgreSQL。

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev:selfhost
```

打开 `http://localhost:3000`，第一次访问会进入初始化页面。

## Docker Compose

1. 复制 `.env.example` 为 `.env`；
2. 修改数据库密码；
3. 生成至少 32 位的 `BETTER_AUTH_SECRET`；
4. 将 `APP_URL` 和 `BETTER_AUTH_URL` 改成实际 HTTPS 域名；
5. 启动：

```bash
docker compose up -d --build
```

## Coolify

- 创建 Docker Compose 类型资源；
- 仓库根目录选择本项目；
- 配置 `.env.example` 中的环境变量；
- 将域名绑定到 `app` 服务的 `3000` 端口；
- 必须让 `APP_URL` 与 `BETTER_AUTH_URL` 等于完整外部地址，例如 `https://front.example.com`；
- PostgreSQL 数据保存于 `frontstage-postgres` 卷；
- 首次部署完成后访问域名创建唯一管理员。

## 常用命令

```bash
npm run typecheck
npm run lint
npm test
npm run db:generate
npm run db:migrate
npm run build:selfhost
```

## 备份

v0.1 的关键数据全部位于 PostgreSQL。上线后应定期执行 `pg_dump`，并把备份保存到另一台主机或对象存储。

## 安全提醒

- 不要提交 `.env`；
- 不要使用示例密码和示例密钥；
- 生产环境必须启用 HTTPS；
- 初始化完成后，系统会拒绝创建第二个账号；
- 数据隔离由服务端查询和数据库关系共同保证。