import express from "express";

import { createProxyMiddleware } from 'http-proxy-middleware';

import { expressjwt } from "express-jwt";

import 'dotenv/config';

const router = express();

const ENV: any = process.env

const CHECK_JWT = expressjwt({
    secret: Buffer.from(ENV.SECRET_KEY).toString('base64'),
    algorithms: ['HS256']
});

const CONF_MIDDLEWARE = (host: any) => {
  return {
    target: host, 
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq: any, req: any, res: any) => {
        /* handle proxyReq */
        proxyReq.setHeader('X-Proxy-Header', 'secret-value');
      },
      proxyRes: (proxyRes: any, req: any, res: any) => {
        /* handle proxyRes */
      },
      error: (err: any, req: any, res: any) => {
        console.log(res);
        
        res.status(500).send('Proxy Error');
      },
    }
  }
}

const VALIDATION_REQUEST = (err: any, req: any, res: any, next: any) => {
  const proxyHeader = req.headers['x-proxy-header'];
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token...");
  } else {
    if(proxyHeader !== 'secret-value') {
      res.status(403).send('Acesso negado.');
    }
    next(err);
  }
}

router.use('/api/service-task', CHECK_JWT, createProxyMiddleware(CONF_MIDDLEWARE(ENV.HOST_TASK)))

router.use('/api/service-auth', createProxyMiddleware(CONF_MIDDLEWARE(ENV.HOST_AUTH)));

router.use(VALIDATION_REQUEST);

router.listen(ENV.PORT, () => {
    console.log(`Server is running on port : ${ENV.PORT} `);
})