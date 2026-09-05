# **Project Task & Calendar Hub 要件定義書 (PRD)**

# **1\. システム概要 & 目的**

* **システム名**: Project Task & Calendar Hub  
* **目的**: 複数プロジェクトのタスク一覧（TODO）と日々の作業時間枠（カレンダー）を一元化し、「何をすべきか」から「いつ実行するか」への移行をスムーズに行う。  
* **想定利用環境**: デスクトップブラウザ優先（Chrome等）

# **2\. 推奨技術スタック**

* **Framework**: Next.js 14+ (App Router), TypeScript  
* **Styling & UI**: Tailwind CSS, shadcn/ui, Lucide React  
* **Drag & Drop**: @dnd-kit/core, @dnd-kit/utilities  
* **Date Handling**: date-fns  
* **State & Storage**: Zustand または React Context \+ LocalStorage（初期プロトタイプ）

# **3\. データモデル仕様（タスク・ライフサイクル拡張版）**

## **3.1 タスクステータス（ライフサイクル定義）**

* `backlog`: アイデア・ストック（未定のタスク）  
* `todo`: 直近実施対象（日程未確定だが着手予定）  
* `scheduled`: カレンダー枠へ配置済み（日時決定）  
* `in_progress`: 現在着手・実行中  
* `completed`: 完了済み  
* `archived`: 完了または取り下げ後、非表示保管

## **3.2 TypeScript 型定義案**

export type ProjectId \= string;

export type TaskId \= string;

export type TaskStatus \= 

  | 'backlog' 

  | 'todo' 

  | 'scheduled' 

  | 'in\_progress' 

  | 'completed' 

  | 'archived';

export type TaskPriority \= 'high' | 'medium' | 'low';

|---|

export interface Project {

  id: ProjectId;

  name: string;

  color: string; // TailwindカラークラスまたはHEX (例: \#3B82F6)

  status: 'active' | 'archived';

  order: number;

}

export interface Task {

  id: TaskId;

  projectId: ProjectId;

  title: string;

  description?: string;

  status: TaskStatus;

  priority: TaskPriority;

  estimatedMinutes?: number; // 見積もり時間 (分)

  actualMinutes?: number;    // 実績作業時間 (分)

  dueDate?: string;          // 締め切り日 (YYYY-MM-DD)

  scheduledDate?: string;    // カレンダー配置日 (YYYY-MM-DD)

  startTime?: string;        // 開始時刻 (HH:mm)

  endTime?: string;          // 終了時刻 (HH:mm)

  createdAt: string;         // ISO string

  updatedAt: string;         // ISO string

  completedAt?: string;      // ISO string

}

export interface Milestone {

  id: string;

  projectId: ProjectId;

  title: string;

  startDate: string; // YYYY-MM-DD

  endDate: string;   // YYYY-MM-DD

  status: 'planned' | 'in\_progress' | 'completed';

}

# **4\. 画面レイアウト & コンポーネント構成**

* **ヘッダー**: プロジェクト絞り込みセレクター、週移動ナビゲーション（前週・今週・翌週）、新規タスク追加ボタン。  
* **左ペイン（TODOトレイ）**:  
  * ステータスタブ切り替え（Backlog / Ready To Schedule / 完了済み）。  
  * プロジェクト別カラーバッジ、見積もり時間、優先度表示。  
  * カレンダーへのドラッグ可能アイテム。  
* **メインペイン（週間バーチカルカレンダー）**:  
  * 06:00〜24:00の時間軸グリッド（夜のルーティン・作業枠21:00〜24:00が見やすい設定）。  
  * TODOトレイからのドロップで自動的に `status: 'scheduled'` に変更、`scheduledDate`, `startTime`, `endTime` をセット。  
  * スロットの伸縮（リサイズ）で所要時間を直感的に変更。  
  * カレンダー上のチェックボックスで `completed` への即座切り替え。

# **5\. 段階的実装ロードマップ（AIエージェント開発向け）**

| フェーズ | 開発内容の詳細 |
| :---- | :---- |
| **Phase 1 (基礎)** | Next.js \+ Tailwind \+ shadcn/ui セットアップ、型定義、モックデータによる一覧表示。 |
| **Phase 2 (TODO機能)** | タスク作成・編集・削除・ステータス更新・フィルタリング。 |
| **Phase 3 (カレンダー連携)** | 週間バーチカルビュー描画、@dnd-kitによるドラッグ＆ドロップ配置、時間変更。 |
| **Phase 4 (永続化 & ブラッシュアップ)** | LocalStorage保存、定常作業枠テンプレート配置、UI微調整。 |
| **Phase 5 (拡張機能・将来構想)** | プロジェクト単位のタイムライン（マイルストーン表示）、Googleカレンダー連携。 |

# **6\. AIエージェントへの初回指示プロンプト例**

「PRD.mdの仕様に基づき、まずはPhase 1としてNext.js (App Router) \+ TypeScript \+ Tailwind CSSのプロジェクト骨格を作成し、PRDの型定義に沿ったモックデータとUIレイアウト（ヘッダー、左TODOトレイ、右週間カレンダー）のダミー表示を実装してください。」