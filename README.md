Test if nginx can utilize http2 parallel requests ability with http2 frontend and multiple http backends

- start server: `ts-node server.ts`
- set nginx use nginx-http2.conf.example
- run client to test: `ts-node client.ts`
