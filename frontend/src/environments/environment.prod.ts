export const environment = {
  production: true,
  // Relative path - since MLM.API now serves this Angular build itself from
  // wwwroot (same origin), API calls should hit whatever domain the app is
  // actually loaded from, not a hardcoded placeholder domain. If you ever
  // host the frontend and API on different domains, replace this with the
  // real API's absolute URL (e.g. 'https://api.your-real-domain.com/api').
  apiUrl: '/api',
};
