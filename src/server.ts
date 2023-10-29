import App from "@/app";
import AuthRoute from "@api/auth/auth.route";
import ArticleRoute from "@api/article/article.route";

const app = new App([new AuthRoute(), new ArticleRoute()]);

app.listen();
