# 英語学習教材自動生成アプリ

英文をAI(Gemini)で「英文 → 段落 → 文 → 単語」の4階層に解析し、
復習用クイズ・フラッシュカードを自動生成する学習アプリ。Docker不使用。

```
Global-app/
  backend/    # FastAPI + Supabase + Gemini連携
  frontend/   # Expo Router + NativeWind + Zustand + React Query
```

## アーキテクチャ概要

```
[Expo App]
  app/**            <- Expo Router (View)
  src/hooks/**       <- React Query (ViewModel: サーバ状態・キャッシュ)
  src/store/**       <- Zustand (ViewModel: グローバル/セッション状態)
  src/api/**         <- axios + DTO⇔ドメイン型マッパー
        |
        | HTTP (JSON) — EXPO_PUBLIC_API_URL
        v
[FastAPI Backend]
  api/v1/endpoints/** <- ルーティング
  services/           <- Gemini解析オーケストレーション / Supabase永続化
  schemas/            <- Pydanticモデル(4階層データ)
        |
        | supabase-py
        v
[Supabase (PostgreSQL)]
  articles -> paragraphs -> sentences -> vocabulary
  quiz_questions / review_cards
```

## データモデル(4階層 + 付随テーブル)

| テーブル | 説明 |
| --- | --- |
| `articles` | 英文全体(タイトル・要約・難易度) |
| `paragraphs` | 段落(article_id 参照) |
| `sentences` | 文(paragraph_id 参照、文法ポイント) |
| `vocabulary` | 単語(sentence_id 参照、意味・品詞・発音) |
| `quiz_questions` | 復習用クイズ(vocabulary/sentence種別) |
| `review_cards` | 単語ごとの間隔反復用シード(フラッシュカード) |

DDLは `backend/supabase/schema.sql`。開発初期のためRLSは無効。

## セットアップの流れ

1. Supabaseプロジェクトを作成し、SQL Editorで `backend/supabase/schema.sql` を実行
2. `backend/README.md` の手順でFastAPIを起動 (`uvicorn app.main:app --reload --port 8000`)
3. `frontend/README.md` の手順でExpoを起動 (`npx expo start`)
4. (任意) Gemini APIキーを `backend/.env` に設定すると実際のAI解析が有効化。
   未設定でも決定的なモック解析にフォールバックするため `POST /v1/articles/analyze` は
   そのまま動作します。

## 主要API

| Method | Path | 説明 |
| --- | --- | --- |
| POST | `/v1/articles/analyze` | 英文を4階層に解析しクイズ生成、Supabaseへ一括保存 |
| GET | `/v1/articles` | 英文一覧 |
| GET | `/v1/articles/{id}` | 英文詳細(段落・文・単語を含む) |
| GET | `/v1/articles/{id}/questions` | 復習用クイズ取得 |
