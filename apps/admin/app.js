const { createServer } = require("http");
const next = require("next");

const dev = false;

const app = next({
  dev,
  dir: __dirname
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(process.env.PORT);
});