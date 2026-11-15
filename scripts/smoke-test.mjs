const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";

const routes = [
  { path: "/login", expectedStatus: 200 },
  { path: "/signup", expectedStatus: 200 },
  { path: "/api/auth/session", expectedStatus: 200 },
];

for (const route of routes) {
  const response = await fetch(new URL(route.path, baseUrl));

  if (response.status !== route.expectedStatus) {
    throw new Error(
      `${route.path} returned ${response.status}; expected ${route.expectedStatus}`,
    );
  }

  console.log(`PASS ${route.path} (${response.status})`);
}
