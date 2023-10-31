import App from "@/app";
import AuthRoute from "@api/auth/auth.route";
import ArticleRoute from "@api/article/article.route";
import ForumRoute from "./api/forum/forum.route";

const app = new App([new AuthRoute(), new ArticleRoute(), new ForumRoute()]);

app.listen();
