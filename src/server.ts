import express from "express";

import { createProxyMiddleware } from 'http-proxy-middleware';

import { expressjwt } from "express-jwt";

const app = express();

const SECRET_KEY = Buffer.from("node-auth").toString('base64');;
const PORT = 3000;

const checkJwt = expressjwt({
    secret: SECRET_KEY,
    algorithms: ['HS256'],
});

app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:3001/singin', changeOrigin: true }));

app.use('/api/tasks', checkJwt, createProxyMiddleware({ target: 'http://localhost:3002/task/all', changeOrigin: true }));

app.use(function (err: any, req: any, res: any, next: any) {
    if (err.name === "UnauthorizedError") {
      res.status(401).send("invalid token...");
    } else {
      next(err);
    }
  });

app.listen(PORT, () => {
    console.log(`servidor on port: ${PORT}`);
})