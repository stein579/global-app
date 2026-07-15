# Backend (FastAPI)

英文記事をAI(Gemini)で「記事 → 段落 → 文 → 単語」の4階層に解析し、
Supabase(PostgreSQL)へ一括保存する API。Docker不使用、ローカルの Python venv で起動します。

## セットアップ

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # SUPABASE_URL / SUPABASE_KEY / GEMINI_API_KEY を設定
```

`GEMINI_API_KEY` が未設定でも `POST /v1/articles/analyze` は動作します
(`app/services/gemini_service.py` が決定的なモック解析にフォールバックするため)。

## Supabase スキーマの適用

Supabase ダッシュボードの SQL Editor で `supabase/schema.sql` を実行してください。
`articles / paragraphs / sentences / vocabulary / quiz_questions / review_cards`
の6テーブルが作成されます。開発初期のため **RLSは無効** です。

## 起動

```bash
uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- ヘルスチェック: http://localhost:8000/health

## エンドポイント

| Method | Path                              | 説明                                                   |
| ------ | ---------------------------------- | ------------------------------------------------------ |
| POST   | `/v1/articles/analyze`             | 英文を4階層データに解析しクイズを生成、Supabaseへ保存 |
| GET    | `/v1/articles`                     | 記事一覧取得                                            |
| GET    | `/v1/articles/{id}/questions`      | 指定記事の復習用クイズ取得                             |

## ディレクトリ構成

```
backend/
  app/
    core/            # 設定(Pydantic Settings) / Supabaseクライアント
    api/v1/endpoints/ # ルーティング
    schemas/         # Pydanticモデル(4階層データ, クイズ)
    services/        # Gemini連携 / 解析オーケストレーション / Supabase永続化
    main.py
  supabase/
    schema.sql       # テーブル定義(DDL)
```
