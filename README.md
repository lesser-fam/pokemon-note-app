# Matchup Note

ポケモン対戦のパーティ構築、選出、対戦ログ、振り返りを一元管理する学習支援アプリです。

対戦前には相手パーティとの相性を見ながら選出を考え、対戦後には勝敗や反省点を記録できます。自分の判断を残して振り返ることで、次の対戦に活かすことを目的にしています。

## 画面イメージ

現在準備中です。後で主要画面のキャプチャを追加します。

- ログイン画面
- パーティ一覧
- パーティ詳細
- 選出練習
- バトルプレビュー
- 対戦ログ作成

## 主な機能

- ユーザー登録、ログイン、ログアウト
- パーティの作成、編集、削除
- パーティ内ポケモンの登録
- パーティのバージョン管理
- 基本選出テンプレートの登録
- 相手パーティテンプレートの確認、管理
- 選出練習
- バトルプレビュー
- 対戦ログの作成、編集、削除
- 対戦ログをもとにした勝敗や反省点の振り返り
- ポケモン、技、特性、道具、性格などのマスタデータ参照

## 使用技術

### フロントエンド

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios

### バックエンド

- Laravel
- Laravel Sanctum
- PHP
- MySQL または SQLite

### 開発環境

- Node.js
- npm
- Composer
- Laravel Sail

## ディレクトリ構成

```text
pokemon-note-app/
├── backend/   # Laravel API
└── frontend/  # Next.js frontend
```

## 環境構築

### 1. リポジトリをクローン

```bash
git clone https://github.com/lesser-fam/pokemon-note-app.git
cd pokemon-note-app
```

### 2. バックエンドのセットアップ

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

`.env` を必要に応じて編集します。

SQLite を使う場合は、以下のように設定します。

```env
DB_CONNECTION=sqlite
```

MySQL を使う場合は、利用する環境に合わせて以下を設定します。

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pokemon_note_app
DB_USERNAME=root
DB_PASSWORD=
```

フロントエンドとCookie認証を連携するため、ローカル開発では以下も設定します。

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

マイグレーションとシーディングを実行します。

```bash
php artisan migrate --seed
```

### 3. フロントエンドのセットアップ

別ターミナルで実行します。

```bash
cd frontend
npm install
```

`frontend/.env.local` を作成し、APIの接続先を設定します。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 起動方法

### バックエンド

```bash
cd backend
php artisan serve
```

デフォルトでは `http://localhost:8000` で起動します。

### フロントエンド

```bash
cd frontend
npm run dev
```

デフォルトでは `http://localhost:3000` で起動します。

## デモアカウント

シーダーを実行すると、以下のテストユーザーが作成されます。

```text
一般ユーザー
メールアドレス: test@example.com
パスワード: password

管理者ユーザー
メールアドレス: admin@example.com
パスワード: password
```

## 確認コマンド

### フロントエンド

```bash
cd frontend
npm run lint
npm run build
```

### バックエンド

```bash
cd backend
composer test
```

## ER図

現在準備中です。後でER図を追加します。

主な関係は以下です。

```text
users
  └── parties
        └── party_versions
              ├── party_pokemon
              ├── selection_templates
              └── battle_logs
```

## 要件定義・設計資料

現在準備中です。後で以下の資料を追加します。

- 要件定義書
- 基本設計書
- 画面設計
- API設計
- DB設計

## 今後の改善予定

- READMEへの画面キャプチャ追加
- ER図の追加
- 要件定義書、設計書の追加
- 主要機能のテスト追加
- 管理者向け機能の権限整理
- UIの細部調整
- デプロイ手順の整理
