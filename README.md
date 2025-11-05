# Spring Boot デモアプリ

## Spring Boot の環境構築

最新バージョンの temurin をインストールする。
Temurin は OpenJDK ディストリビューション(配布版)の 1 つ。

```zsh
brew install --cask temurin@25
```

Java 用の環境変数を.zshrc に設定する。(バージョンは最新バージョンの数字で置き換える)

```zsh
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

Java インストール後に確認する。

```zsh
echo $JAVA_HOME
java -version
```

VSCode 拡張機能の[Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)と[Spring Boot Extension Pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack)をインストールする。

[Spring Initializr](https://start.spring.io/)を開く。
「Maven」→「Java」→ 正式版最新バージョンの順に選択し、Packaging は「Jar」を、Configuration は「YAML」を、Java は最新バージョンを選択し、「GENERATE」でダウンロードする。

## CLAUDE.md の生成

以下の内容を Claude に入力する。

Next.js と Spring Boot と MySQL で Web アプリを作りたいです。Java バージョンは 25、Spring Boot バージョンは 3.5.7 で、Maven を使います。
作りたい Web アプリは単文投稿サービスです。
トップページには全ユーザーの投稿が 1 つのタイムラインに最新投稿順に表示されます。20 件ずつ読み込む、スクロールトリガーの無限ローディング方式です。また登録ユーザーであれば投稿内容入力フォームも表示され、200 文字以内のメッセージを投稿できます。
会員登録画面では、メールアドレスと 8 桁以上のパスワードで会員登録できます。登録後はそのメールアドレス宛に AWS SES によって「登録ありがとうございます」メールを送信します。
ログイン画面もあります。
パスワードリセット画面と新しいパスワード入力画面もあります。
公開プロフィール画面では、そのユーザーのプロフィール情報（256px 四方の丸型プロフィール画像・ユーザー名・1000 文字以内の紹介文・フォロー数・フォロワー数）とユーザーの投稿内容一覧が最新投稿順で表示されます。またログインしているユーザー自身のページであれば、投稿内容入力フォームも表示され、200 文字以内のメッセージを投稿できます。またログインしているユーザー自身のページであれば、プロフィール編集画面へのリンクが表示されます。
プロフィール編集画面では、ユーザーのプロフィール情報を編集でき、保存すると公開プロフィール画面に戻ります。
なお、投稿された内容の本文中の URL は、遷移可能リンクとして表示されます。
ユーザーの投稿に返信したり、ハートマークのボタンを押して「いいね」することもできます。各投稿に返信や「いいね」があれば、その数が表示されます。
以上の要件に従って CLAUDE.md の内容を考えてください。
