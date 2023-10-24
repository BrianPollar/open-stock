import express from 'express';

/** */
export const createExpressServer = () => {
  const app = express();
  app.use(express.json());
  return app;
};
