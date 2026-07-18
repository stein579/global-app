# Frontend (Expo / React Native)

Expo Router + NativeWind + Zustand + React Query によるMVVM構成のクライアント。
UIコンポーネント(`src/components`)は純粋な描画に徹し、ロジックはすべて
`src/hooks`(React Queryによる通信・キャッシュ)と `src/store`(Zustandによる
グローバル/セッション状態)に閉じています。

## セットアップ

```bash
cd frontend
npm install
cp .env.example .env       # EXPO_PUBLIC_API_URL をバックエンドのURLに合わせる
npx expo install --fix     # Expo SDKに合わせて依存関係のバージョンを整合
```

## 起動 (Docker不使用、Expo CLIのみ)

```bash
npx expo start
```

iOSシミュレータ / Android エミュレータ / 実機のExpo Goアプリでスキャンして起動できます。
バックエンド(`../backend`)を `uvicorn app.main:app --reload --port 8000` で先に起動してください。
実機で確認する場合は `EXPO_PUBLIC_API_URL` を `http://<PCのローカルIP>:8000` に変更してください。

## ディレクトリ構成 (MVVM)

```
frontend/
  app/                      # Expo Router (画面 = View)
    (tabs)/                 # ボトムタブ: ダッシュボード/英文/単語帳/復習/設定
      dashboard.tsx
      articles/
        index.tsx           # 英文一覧 + 新規AI解析フォーム
        [id].tsx            # 英文詳細(4階層データ表示)
      vocabulary/
        index.tsx           # 英文を選んで単語帳を開くための一覧
        [id].tsx            # 選択した英文の全単語一覧
      review/index.tsx       # 復習ハブ
      settings/index.tsx     # テーマ・学習目標・読み上げ音声設定
    quiz/
      vocabulary.tsx        # 単語クイズ(QuizSessionを利用)
      sentence.tsx          # 文章クイズ(QuizSessionを利用)
    cards/flash.tsx          # 単語フラッシュカード
  src/
    components/             # 再利用可能なUI (Card, Button, ProgressBar, GradientHeader, QuizSession)
    hooks/                  # React Query によるAPI通信・キャッシュ (ViewModel)
    store/                  # Zustand によるグローバル/セッション状態 (ViewModel)
    api/                    # axiosクライアント + DTO⇔ドメイン型 マッパー
    types/                  # ドメイン型定義 (バックエンドの4階層データと対応)
    constants/theme.ts      # デザイントークン(紫グラデーション等)
```

## デザインシステム

- 明るい背景 (`bg-primary-50` / dark: `bg-neutral-900`) を基調
- ヘッダーは `expo-linear-gradient` による紫グラデーション (`GradientHeader`)
- `tailwind.config.js` の `darkMode: "class"` + `nativewind` の `useColorScheme`
  で、`settings` 画面から選択したテーマ(ライト/ダーク/端末に合わせる)を
  即時反映
