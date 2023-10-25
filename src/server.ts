import App from "@/app";
import AuthRoute from "@api/auth/auth.route";

const app = new App([new AuthRoute()]);

app.listen();
