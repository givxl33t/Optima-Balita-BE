import App from "@/app";
import AuthRoute from "@api/auth/auth.route";
import UserRoute from "@api/user/user.route";
import ArticleRoute from "@api/article/article.route";
import ForumRoute from "./api/forum/forum.route";
import NutritionRoute from "./api/nutrition/nutrition.route";

const app = new App([
  new AuthRoute(),
  new ArticleRoute(),
  new ForumRoute(),
  new NutritionRoute(),
  new UserRoute(),
]);

app.listen();
