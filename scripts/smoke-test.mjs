const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";

const routes = [
  "/",
  "/products",
  "/products/zeib-crown-leather-shoes",
  "/cart",
  "/checkout",
  "/login?email=user%40zeibshoes.my.id&password=123456",
  "/signup",
  "/forgot-password",
  "/reset-password?email=user%40zeibshoes.my.id",
  "/account",
  "/orders",
  "/wishlist",
  "/reviews",
  "/compare",
  "/admin",
  "/admin/products",
  "/admin/products/add",
  "/admin/products/edit/prd-001",
  "/admin/orders",
  "/faq",
  "/size-guide",
  "/delivery-returns",
  "/contact"
];

async function checkRoute(route, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  if (response.status !== expectedStatus) {
    throw new Error(`${route} returned ${response.status}, expected ${expectedStatus}`);
  }
  return `${route} -> ${response.status}`;
}

const results = [];

for (const route of routes) {
  results.push(await checkRoute(route));
}

results.push(await checkRoute("/missing-zeib-page", 404));

console.log(`Smoke test passed for ${results.length} routes at ${baseUrl}`);
for (const result of results) {
  console.log(result);
}
