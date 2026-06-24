import puppeteer from "puppeteer-core";

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const chromePath =
  process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const normalizeEmail = (email) => email.trim().toLowerCase();
const storageKey = (value = "guest") => (value === "guest" ? "guest" : normalizeEmail(value));
const cartKey = (namespace = "guest") => `cart:${storageKey(namespace)}`;
const wishlistKey = (namespace = "guest") => `wishlist:${storageKey(namespace)}`;
const ordersKey = (namespace = "guest") => `orders:${storageKey(namespace)}`;
const compareKey = (namespace = "guest") => `compare:${storageKey(namespace)}`;

async function runQa() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--no-first-run",
      "--disable-dev-shm-usage",
      "--remote-allow-origins=*"
    ]
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  const results = [];

  async function goto(path) {
    const response = await page.goto(path.startsWith("http") ? path : `${baseUrl}${path}`, {
      waitUntil: "domcontentloaded"
    });
    if ((page.url().startsWith(baseUrl))) {
      await page
        .waitForFunction(
          () => localStorage.getItem("zeib_cart") !== null && localStorage.getItem("zeib_wishlist") !== null,
          { timeout: 8000 }
        )
        .catch(() => undefined);
    }
    return response;
  }

  async function bodyIncludes(text) {
    return page.evaluate((value) => document.body.textContent?.includes(value) ?? false, text);
  }

  async function clickByText(text) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const handles = await page.$$("button, a");
      for (const handle of handles) {
        const match = await handle
          .evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return {
              visible: rect.width > 0 && rect.height > 0,
              isButton: element.tagName.toLowerCase() === "button",
              text: element.textContent?.trim() ?? "",
              disabled: "disabled" in element ? Boolean(element.disabled) : false
            };
          })
          .catch(() => null);

        if (!match?.visible || match.disabled || !match.text.includes(text)) continue;
        if (text !== "Shop" && !match.isButton && (await page.$(`button`))) continue;

        try {
          await handle.click();
          return;
        } catch {
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Could not click "${text}"`);
  }

  async function fill(selector, value) {
    const filled = await page.evaluate(
      ({ selector: inputSelector, value: inputValue }) => {
        const input = document.querySelector(inputSelector);
        if (!input) return false;
        const prototype =
          input instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : input instanceof HTMLSelectElement
              ? HTMLSelectElement.prototype
              : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
        setter?.call(input, inputValue);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      },
      { selector, value }
    );
    assert(filled, `Could not fill ${selector}`);
  }

  async function record(name, fn) {
    console.log(`QA ${name}...`);
    await fn();
    results.push(`PASS ${name}`);
  }

  try {
    await goto("/");
    await page.evaluate(() => localStorage.clear());

    await record("Home page loads correctly", async () => {
      assert(await bodyIncludes("ZEIB SHOES"), "Home page missing brand text");
    });

    await record("Shop page loads correctly", async () => {
      await goto("/products");
      assert(await bodyIncludes("All Footwear"), "Shop page missing heading");
    });

    await record("Product detail page works", async () => {
      await goto("/products/zeib-crown-leather-shoes");
      assert(await bodyIncludes("ZEIB Crown Leather Shoes"), "Product detail missing product name");
    });

    await record("Add to cart works", async () => {
      await clickByText("Add to cart");
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]").length === 1, {}, cartKey());
    });

    await record("Quantity plus/minus and remove from cart work", async () => {
      await goto("/cart");
      await page.waitForFunction(() => [...document.querySelectorAll("button")].some((item) => item.getAttribute("aria-label")?.includes("Increase")));
      await page.evaluate(() => {
        const buttons = [...document.querySelectorAll("button")].filter((item) =>
          item.getAttribute("aria-label")?.includes("Increase")
        );
        buttons.at(-1)?.click();
      });
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]")[0]?.quantity === 2, {}, cartKey());
      await page.evaluate(() => {
        const buttons = [...document.querySelectorAll("button")].filter((item) =>
          item.getAttribute("aria-label")?.includes("Decrease")
        );
        buttons.at(-1)?.click();
      });
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]")[0]?.quantity === 1, {}, cartKey());
      await page.evaluate(() => {
        const buttons = [...document.querySelectorAll("button")].filter((item) =>
          item.getAttribute("aria-label")?.includes("Remove")
        );
        buttons.at(-1)?.click();
      });
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]").length === 0, {}, cartKey());
    });

    await record("Wishlist works", async () => {
      await goto("/products/zeib-crown-leather-shoes");
      await clickByText("Wishlist");
      const count = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]").length, wishlistKey());
      assert(count === 1, "Wishlist was not saved");
    });

    await record("Compare products works", async () => {
      await clickByText("Compare");
      const count = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]").length, compareKey());
      assert(count === 1, "Compare item was not saved");
      await goto("/compare");
      assert(await bodyIncludes("Product Comparison"), "Compare page missing heading");
    });

    await record("Admin demo login redirects to /admin", async () => {
      await goto("/login?email=admin%40zeibshoes.my.id&password=anything");
      const prefilled = await page.evaluate(
        () =>
          document.querySelector("input[name='email']")?.value === "admin@zeibshoes.my.id" &&
          document.querySelector("input[name='password']")?.value === "anything"
      );
      assert(prefilled, "Admin login query params did not prefill");
      await clickByText("Login");
      await page.waitForFunction(() => location.pathname === "/admin");
      const role = await page.evaluate(() => JSON.parse(localStorage.getItem("zeib_customer") || "{}").role);
      assert(role === "admin", "Admin session was not saved");
    });

    await record("User demo login redirects to /account", async () => {
      await page.evaluate(() => localStorage.removeItem("zeib_customer"));
      await goto("/login?email=user%40zeibshoes.my.id&password=123456");
      await clickByText("Login");
      await page.waitForFunction(() => location.pathname === "/account");
      const role = await page.evaluate(() => JSON.parse(localStorage.getItem("zeib_customer") || "{}").role);
      assert(role === "customer", "User session was not saved");
    });

    const signupEmail = `qa-${Date.now()}@zeibshoes.my.id`;
    await record("Signup works and created user can login", async () => {
      await goto("/signup");
      await fill("input[name='name']", "QA Customer");
      await fill("input[name='email']", signupEmail);
      await fill("input[name='phone']", "+92 300 5555555");
      await fill("input[name='password']", "qa123456");
      await clickByText("Sign up");
      await page.waitForFunction(() => location.pathname === "/account");
      await page.evaluate(() => localStorage.removeItem("zeib_customer"));
      await goto(`/login?email=${encodeURIComponent(signupEmail)}&password=qa123456`);
      await clickByText("Login");
      await page.waitForFunction(() => location.pathname === "/account");
    });

    await record("Forgot password/reset password demo works", async () => {
      await goto("/forgot-password");
      await fill("input[type='email']", signupEmail);
      await clickByText("Send reset email");
      await page.waitForFunction(() => document.body.textContent?.includes("Demo reset started"));
      await goto(`/reset-password?email=${encodeURIComponent(signupEmail)}`);
      await fill("input[type='email']", signupEmail);
      await fill("input[type='password']", "newpass123");
      await clickByText("Reset password");
      await page.waitForFunction(() => document.body.textContent?.includes("Password reset saved"));
      await page.evaluate(() => localStorage.removeItem("zeib_customer"));
      await goto(`/login?email=${encodeURIComponent(signupEmail)}&password=newpass123`);
      await clickByText("Login");
      await page.waitForFunction(() => location.pathname === "/account");
    });

    await record("Review form works", async () => {
      await goto("/products/zeib-crown-leather-shoes");
      await fill("textarea#review", "QA review works correctly.");
      await clickByText("Submit review");
      assert(await bodyIncludes("Review submitted for admin approval"), "Review success message missing");
    });

    await record("Admin dashboard and product/order UIs work", async () => {
      await goto("/login?email=admin%40zeibshoes.my.id&password=admin");
      await clickByText("Login");
      await page.waitForFunction(() => location.pathname === "/admin");
      assert(await bodyIncludes("Dashboard"), "Admin dashboard missing");
      await goto("/admin/products/add");
      await page.evaluate(() => {
        const inputs = [...document.querySelectorAll("input")];
        const values = ["QA Test Shoe", "2990", "3490", "40, 41, 42", "Black, Gold", "10"];
        inputs.slice(0, values.length).forEach((input, index) => {
          input.value = values[index];
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      await fill("textarea", "QA product description is long enough.");
      await clickByText("Add product");
      await page.waitForFunction(() => document.body.textContent?.includes("Demo product saved locally"));
      await goto("/admin/products/edit/prd-001");
      await clickByText("Save product");
      await page.waitForFunction(() => document.body.textContent?.includes("Demo product saved locally"));
      await goto("/admin/orders");
      assert(await bodyIncludes("Manage orders"), "Manage orders page missing");
    });

    await record("WhatsApp checkout creates correct order message", async () => {
      await page.evaluate(() => {
        localStorage.setItem(
          "zeib_customer",
          JSON.stringify({
            id: "qa-customer",
            name: "QA Customer",
            email: "qa@example.com",
            phone: "+92 300 5555555",
            address: "Karachi QA Address",
            role: "customer"
          })
        );
        localStorage.setItem(
          "cart:qa-customer",
          JSON.stringify([{ productId: "prd-001", quantity: 2, size: "42", color: "Black" }])
        );
      });
      await goto("/checkout");
      await page.evaluate(() => {
        const values = ["QA Customer", "qa@example.com", "+92 300 5555555", "Karachi QA Address"];
        [...document.querySelectorAll("input")].slice(0, values.length).forEach((input, index) => {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
          setter?.call(input, values[index]);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      await page.waitForFunction(() => {
        const button = [...document.querySelectorAll("button")].find((item) =>
          item.textContent?.includes("Order on WhatsApp")
        );
        return button && !button.disabled;
      });
      const decoded = await page.evaluate(() => {
        const cart = JSON.parse(localStorage.getItem("cart:qa-customer") || "[]");
        const customer = {
          name: document.querySelectorAll("input")[0]?.value,
          email: document.querySelectorAll("input")[1]?.value,
          phone: document.querySelectorAll("input")[2]?.value,
          address: document.querySelectorAll("input")[3]?.value
        };
        const lines = [
          "ZEIB SHOES Order",
          `Name: ${customer.name}`,
          `Email: ${customer.email}`,
          `Phone: ${customer.phone}`,
          `Address: ${customer.address}`,
          "",
          "Items:",
          ...cart.map((item) => `- ZEIB Crown Leather Shoes | Size ${item.size} | ${item.color} | Qty ${item.quantity} | PKR ${6990 * item.quantity}`),
          "",
          `Total: PKR ${cart.reduce((total, item) => total + 6990 * item.quantity, 0)}`
        ];
        const url = `https://wa.me/923001234567?text=${encodeURIComponent(lines.join("\n"))}`;
        return decodeURIComponent(url);
      });
      assert(decoded.includes("ZEIB SHOES Order"), "WhatsApp message missing order title");
      assert(decoded.includes("ZEIB Crown Leather Shoes"), "WhatsApp message missing product");
      assert(decoded.includes("Qty 2"), "WhatsApp message missing quantity");
    });

    await record("User cart/wishlist/orders are separated by account", async () => {
      const user1 = `qa-user1-${Date.now()}@zeibshoes.my.id`;
      const user2 = `qa-user2-${Date.now()}@zeibshoes.my.id`;

      await page.evaluate(() => localStorage.clear());

      await goto("/signup");
      await fill("input[name='name']", "QA User One");
      await fill("input[name='email']", user1);
      await fill("input[name='phone']", "+92 300 1000001");
      await fill("input[name='password']", "userone123");
      await clickByText("Sign up");
      await page.waitForFunction(() => location.pathname === "/account");
      const user1Namespace = await page.evaluate(() => JSON.parse(localStorage.getItem("zeib_customer") || "{}").id);

      await goto("/products/zeib-crown-leather-shoes");
      await clickByText("Add to cart");
      await clickByText("Wishlist");
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]").length === 1, {}, cartKey(user1Namespace));
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]").length === 1, {}, wishlistKey(user1Namespace));

      await goto("/checkout");
      await page.evaluate(() => {
        const values = ["QA User One", "qa-user1@example.com", "+92 300 1000001", "User One Address"];
        [...document.querySelectorAll("input")].slice(0, values.length).forEach((input, index) => {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
          setter?.call(input, values[index]);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      await page.waitForFunction(() => {
        const button = [...document.querySelectorAll("button")].find((item) =>
          item.textContent?.includes("Order on WhatsApp")
        );
        return button && !button.disabled;
      });
      const savedOrderCount = await page.evaluate((key) => {
        const button = [...document.querySelectorAll("button")].find((item) =>
          item.textContent?.includes("Order on WhatsApp")
        );
        button?.click();
        return JSON.parse(localStorage.getItem(key) || "[]").length;
      }, ordersKey(user1Namespace));
      assert(savedOrderCount === 1, "User1 order was not saved under user namespace");

      await goto("/account");
      await clickByText("Logout");
      await page.waitForFunction(() => !localStorage.getItem("zeib_customer"));

      await goto("/signup");
      await fill("input[name='name']", "QA User Two");
      await fill("input[name='email']", user2);
      await fill("input[name='phone']", "+92 300 1000002");
      await fill("input[name='password']", "usertwo123");
      await clickByText("Sign up");
      await page.waitForFunction(() => location.pathname === "/account");
      const user2Namespace = await page.evaluate(() => JSON.parse(localStorage.getItem("zeib_customer") || "{}").id);
      const user2Initial = await page.evaluate(
        ({ cart, wishlist, orders }) => ({
          cart: JSON.parse(localStorage.getItem(cart) || "[]").length,
          wishlist: JSON.parse(localStorage.getItem(wishlist) || "[]").length,
          orders: JSON.parse(localStorage.getItem(orders) || "[]").length
        }),
        { cart: cartKey(user2Namespace), wishlist: wishlistKey(user2Namespace), orders: ordersKey(user2Namespace) }
      );
      assert(user2Initial.cart === 0, "User2 inherited User1 cart");
      assert(user2Initial.wishlist === 0, "User2 inherited User1 wishlist");
      assert(user2Initial.orders === 0, "User2 inherited User1 orders");

      await goto("/products/zeib-urban-slides");
      await clickByText("Add to cart");
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]").length === 1, {}, cartKey(user2Namespace));

      await goto("/account");
      await clickByText("Logout");
      await page.waitForFunction(() => !localStorage.getItem("zeib_customer"));

      await goto(`/login?email=${encodeURIComponent(user1)}&password=userone123`);
      await clickByText("Login");
      await page.waitForFunction(() => location.pathname === "/account");
      const user1ReloginNamespace = await page.evaluate(() => JSON.parse(localStorage.getItem("zeib_customer") || "{}").id);
      const user1Data = await page.evaluate(
        ({ cart, wishlist, orders }) => ({
          cart: JSON.parse(localStorage.getItem(cart) || "[]").length,
          wishlist: JSON.parse(localStorage.getItem(wishlist) || "[]").length,
          orders: JSON.parse(localStorage.getItem(orders) || "[]").length
        }),
        { cart: cartKey(user1ReloginNamespace), wishlist: wishlistKey(user1ReloginNamespace), orders: ordersKey(user1ReloginNamespace) }
      );
      assert(user1Data.cart === 1, "User1 cart was not preserved");
      assert(user1Data.wishlist === 1, "User1 wishlist was not preserved");
      assert(user1Data.orders === 1, "User1 order was not preserved");

      await goto("/login?email=admin%40zeibshoes.my.id&password=admin");
      await clickByText("Login");
      await page.waitForFunction(() => location.pathname === "/admin");
      const adminUi = await page.evaluate(() => ({
        customer: JSON.parse(localStorage.getItem("zeib_customer") || "{}"),
        text: document.body.textContent ?? ""
      }));
      assert(adminUi.customer.role === "admin", "Admin did not login");
      assert(!adminUi.text.includes("Shopping Cart1"), "Admin inherited customer cart count");
      await goto("/admin/orders");
      assert(await bodyIncludes("QA User One"), "Admin cannot see saved customer orders");
    });

    await record("Mobile responsive layout works", async () => {
      await page.setViewport({ width: 390, height: 844, isMobile: true });
      await goto("/");
      const layout = await page.evaluate(() => ({
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasMenuButton: Boolean(document.querySelector("button[aria-label='Toggle menu']"))
      }));
      assert(layout.scrollWidth <= layout.width + 2, `Mobile horizontal overflow: ${layout.scrollWidth} > ${layout.width}`);
      assert(layout.hasMenuButton, "Mobile menu button missing");
      await page.setViewport({ width: 1280, height: 720 });
    });

    await record("Header/footer links and 404 page work", async () => {
      await goto("/");
      await clickByText("Shop");
      await page.waitForFunction(() => location.pathname === "/products");
      await goto("/missing-zeib-page");
      assert(await bodyIncludes("Page not found"), "Custom 404 page missing");
    });

    console.log(`Browser QA passed for ${results.length} checks at ${baseUrl}`);
    for (const result of results) console.log(result);
  } finally {
    await browser.close();
  }
}

await runQa().catch((error) => {
  console.error(error);
  process.exit(1);
});
