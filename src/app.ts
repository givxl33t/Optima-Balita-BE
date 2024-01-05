import { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { RouteInterface } from "@interfaces/routes.interface";

import DB from "@config/database";
import errorMiddleware from "@middlewares/error.middleware";
import limiterMiddleware from "./middlewares/limiter.middleware";
import { StatusCodes as status } from "http-status-codes";
import { PORT, NODE_ENV } from "@/utils/constant.utils";
import { apiResponse } from "@utils/apiResponse.utils";

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: RouteInterface[]) {
    this.app = express();
    this.port = PORT || 3000;
    this.env = NODE_ENV || "development";

    this.connectToDB();
    this.initializeMiddlewares();
    this.initializeHealthCheck();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.initializeNotFound();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`App listening on ${this.port}`);
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  private connectToDB(): void {
    DB.sequelize.sync({ force: false });
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors({ origin: "*", credentials: true }));
    // this.app.use(limiterMiddleware);
  }

  private initializeRoutes(routes: RouteInterface[]): void {
    routes.forEach((route) => {
      this.app.use("/api/", route.router);
    });
  }

  private initializeHealthCheck(): void {
    this.app.get("/", (req: Request, res: Response) => {
      return res.status(status.OK).json(apiResponse(status.OK, "OK", "Health Check Passed"));
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private initializeNotFound(): void {
    this.app.use((req: Request, res: Response) => {
      const message = "Not Found";
      return res.status(status.NOT_FOUND).json(apiResponse(status.NOT_FOUND, "NOT_FOUND", message));
    });
  }
}

export default App;
