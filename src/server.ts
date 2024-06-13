import express from "express";

import { createProxyMiddleware } from 'http-proxy-middleware';

import { expressjwt } from "express-jwt";

const router = express();

const SECRET_KEY = Buffer.from("node-auth").toString('base64');;
const PORT = 3000;

const CHECK_JWT = expressjwt({
    secret: SECRET_KEY,
    algorithms: ['HS256']
});

const CONF_MIDDLEWARE= {
  target: 'http://localhost:3002/', 
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
      res.status(500).send('Proxy Error');
    },
  }
}

const VALIDATION_REQUEST = (err: any, req: any, res: any, next: any) => {
  const proxyHeader = req.headers['x-proxy-header'];

  if(proxyHeader == 'secret-value') {
    next();
  } else {
    console.log("entrou");
    
    res.status(403).send('Acesso negado.');
  }

  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token...");
  } else {
    next(err);
  }
}
router.use('/api/service-task', CHECK_JWT, createProxyMiddleware(CONF_MIDDLEWARE))

router.use('/api/service-auth', createProxyMiddleware({ target: 'http://localhost:3001/singin', changeOrigin: true }));

router.use(VALIDATION_REQUEST);

router.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT} `);
})