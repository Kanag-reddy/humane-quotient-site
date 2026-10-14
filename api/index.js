// Vercel Serverless Function entry point
const app = require('../server/app');

module.exports = (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const apiPath = url.searchParams.get('__vercel_path');

  if (apiPath !== null) {
    url.searchParams.delete('__vercel_path');
    const query = url.searchParams.toString();
    req.url = `/api/${apiPath}${query ? `?${query}` : ''}`;
  }

  return app(req, res);
};
