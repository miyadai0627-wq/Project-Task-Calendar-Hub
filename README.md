# Project Task & Calendar Hub

タスク管理とカレンダー（日/週/月表示）、プロジェクトのマイルストーンタイムラインを1つの画面に統合したWebアプリです。Googleアカウントでログインし、タスク・マイルストーンをデータベースに保存することで、複数端末（PC・スマホ）から同じデータにアクセスできます。

- 本番URL: https://project-task-calendar-hub.vercel.app
- ベース: PRD.md（プロダクト要求定義）をもとに、Claude Codeとの対話を通じてPhaseを区切りながら開発

## 主な機能

- **TODOトレイ + カレンダーのドラッグ&ドロップ**
  未着手タスクを保持する「バックログ/スケジュール待ち/完了済み」のトレイから、日・週・月カレンダーへドラッグ&ドロップしてスケジュールできる（[@dnd-kit](https://dndkit.com/)）。カレンダー上のイベントはドラッグでの移動、端のハンドルでのリサイズにも対応。
- **日/週/月カレンダー**
  0:00〜24:00表示。週・月ビューは横スワイプでの月移動、日ビューは0時をまたいで前日・翌日へ連続スクロールできる。モバイルブラウザのツールバーに隠れないよう `dvh` 単位・セーフエリア考慮済み。
- **ルーティンテンプレート**
  よく使う定型作業（会議・作業時間など）をワンタップでカレンダーに追加。
- **マイルストーンタイムライン**
  プロジェクトを横軸=日付・縦軸=プロジェクトのガントチャート風に表示。バーをタップすると編集、**長押しでドラッグすると日付移動とプロジェクトの付け替えが自在に行える**。
- **Google連携（必須ログイン）**
  Googleアカウントでのサインインをアプリ全体の前提とし（`src/proxy.ts` がガード）、タスク・マイルストーンはユーザーごとにデータベースへ保存。任意でタスクをGoogleカレンダーの予定として同期（作成・更新・削除）できる。
- **レスポンシブ対応**
  スマホではTODOトレイがドロワー表示になるなど、実機検証をもとにUIを調整済み。

## 技術スタック

| 分類 | 使用technology |
|---|---|
| フレームワーク | Next.js 16 (App Router, Turbopack) / React 19 / TypeScript |
| スタイリング | Tailwind CSS v4 |
| 状態管理 | Zustand（`useTaskStore` / `useMilestoneStore`） |
| ドラッグ&ドロップ | @dnd-kit/core（カレンダー）、独自Pointer Events実装（タイムライン） |
| 認証 | NextAuth v5 (beta) + Google OAuth、JWTセッション |
| データベース | Neon Postgres（サーバーレスPostgres） |
| ORM | Prisma ORM v7（`@prisma/adapter-neon` ドライバアダプタ） |
| 外部API連携 | Google Calendar API（`googleapis`） |
| 日付処理 | date-fns |
| ホスティング | Vercel |

## データベーススキーマ

現時点でデータベースに永続化されているテーブルは **`Task`** と **`Milestone`** の2つ。どちらも `userId`（Googleアカウントの `providerAccountId`）でユーザーごとにデータを分離するマルチテナント設計で、`userId` にインデックスを張っている。

> **Project（プロジェクト）はDBテーブルではない。** `src/lib/mock-data.ts` に定義された固定データ（3件）をクライアント側で参照しているだけで、プロジェクトの作成・編集機能は未実装。Task/MilestoneはプロジェクトIDを文字列として保持するのみで、DB上の外部キー制約はない。

### `Task` テーブル

| カラム | 型 | 必須 | 説明 |
|---|---|---|---|
| id | String (cuid) | ✔ | 主キー |
| userId | String | ✔ | 所有者（Googleアカウント）。インデックス対象 |
| projectId | String | ✔ | 所属プロジェクトID（mock-dataのIDを参照、外部キーなし） |
| title | String | ✔ | タスク名 |
| description | String? | - | 詳細メモ |
| status | String | ✔ | `backlog / todo / scheduled / in_progress / completed / archived` |
| priority | String | ✔ | `high / medium / low` |
| estimatedMinutes | Int? | - | 見積り時間（分） |
| actualMinutes | Int? | - | 実績時間（分） |
| dueDate | String? | - | 締切日 |
| scheduledDate | String? | - | カレンダー上に配置した日付 |
| startTime / endTime | String? | - | カレンダー上の開始・終了時刻 |
| googleEventId | String? | - | 同期先のGoogleカレンダーイベントID |
| createdAt / updatedAt | DateTime | ✔ | 作成・更新日時（自動） |
| completedAt | DateTime? | - | 完了日時 |

### `Milestone` テーブル

| カラム | 型 | 必須 | 説明 |
|---|---|---|---|
| id | String (cuid) | ✔ | 主キー |
| userId | String | ✔ | 所有者（Googleアカウント）。インデックス対象 |
| projectId | String | ✔ | 所属プロジェクトID |
| title | String | ✔ | マイルストーン名 |
| startDate / endDate | String | ✔ | タイムライン上の期間（YYYY-MM-DD） |
| status | String | ✔ | `planned / in_progress / completed` |
| createdAt / updatedAt | DateTime | ✔ | 作成・更新日時（自動） |

マイグレーション履歴（`prisma/migrations/`）:

1. `20260911205018_init` — `Task` テーブル作成
2. `20260913203405_add_milestone` — `Milestone` テーブル追加

## ディレクトリ構成（`src/`）

```
app/                 App Router のページと /api ルート
  api/auth/           NextAuthハンドラ
  api/tasks/           タスクCRUD API
  api/milestones/      マイルストーンCRUD API
  api/calendar/sync/   Googleカレンダー同期API
components/
  layout/              AppShell / AppHeader など画面全体の骨格
  calendar/            日/週/月カレンダー・イベントブロック
  todo/                TODOトレイ・タスク編集モーダル
  timeline/            マイルストーンタイムライン・編集モーダル
  auth/                Googleログインボタン
store/                 Zustandストア（タスク/マイルストーン）
lib/                   カレンダー計算・タイムライン計算・定数・mockデータ
types/                 Task / Milestone / Project の型定義
generated/prisma/      Prisma Clientの生成コード（gitignore対象）
```

## セットアップ

```bash
npm install

# .env.local に以下を設定
# DATABASE_URL=（Neon Postgresの接続文字列）
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# AUTH_SECRET=（npx auth secret などで生成）

npx prisma migrate dev   # 初回のみ・スキーマをDBに反映
npm run dev
```

Google OAuth の認可済みリダイレクトURIには `http://localhost:3000/api/auth/callback/google`（本番は `https://<デプロイ先ドメイン>/api/auth/callback/google`）を登録する。

## デプロイ

Vercel + Neon Postgres（Vercel Storage経由で接続）。`npm run build` は `prisma migrate deploy && next build` を実行するため、デプロイ時に未適用のマイグレーションが自動反映される。

## この開発について

PRD.md（プロダクト要求定義）を起点に、Claude Codeとの対話でフェーズを区切りながら段階的に実装した。

1. **Phase 1**: ディレクトリ構成・型定義・モックデータでの静的UI
2. **Phase 2**: タスクの作成・編集・削除・ステータス変更・フィルタリング
3. **Phase 3**: TODOトレイ⇄カレンダー間のドラッグ&ドロップ、イベントのリサイズ
4. **Phase 4**: LocalStorage永続化、ルーティンテンプレート、UIポリッシュ
5. **マイルストーンタイムライン**: 当初は読み取り専用のガントチャート表示として実装
6. **バックエンド化**: 「スマホからもアクセスしたい」という要望をきっかけに、LocalStorageベースの単一端末構成から、Googleログイン必須＋Neon Postgres＋Prisma 7によるマルチデバイス同期構成へ移行
7. **モバイルUX改善**: 実機（スマホ）での検証を重ね、カレンダー表示時間帯、レスポンシブレイアウト、日本語ラベル、モーダルがブラウザのUIに隠れる問題、日をまたぐ連続スクロール、月表示のスワイプ移動・現在位置表示などを修正
8. **マイルストーンのDB連携化**: タイムラインが実データと連動しておらず編集もできなかった問題を解消し、Taskと同じ設計パターン（Prismaモデル→API→Zustandストア→フォームモーダル）でマイルストーンのCRUD機能をDB連携で実装
9. **タイムラインのドラッグ操作**: マイルストーンバーを長押し→ドラッグで、日付の移動とプロジェクト行の付け替えを直感的に行えるように拡張

開発を通じて、Next.js 16／Prisma 7／NextAuth v5（いずれも比較的新しいメジャーバージョン）特有の破壊的変更への対応や、実機でのモバイルUX検証・改善を重視した。
