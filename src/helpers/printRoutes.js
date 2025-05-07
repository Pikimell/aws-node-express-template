export function printRoutes(app, server = "http://localhost:3000") {
  console.log(`\n🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺 ROUTES 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺\n`);

  const walk = (stack, prefix = "") => {
    stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(", ")
          .padEnd(7);

        const path = `${prefix}${layer.route.path}`.replace(/\/+/g, "/");
        console.log(`🔹 ${methods} ${server}${path}`);
      } else if (layer.name === "router" && layer.handle?.stack) {
        const str = `${layer.regexp}`
          .replace("^\\/", "")
          .replace("?(?=\\/|$)/i", "")
          .replace("\\/", "/");
        const path = str;
        walk(layer.handle.stack, prefix + path);
      }
    });
  };

  walk(app._router.stack);

  console.log(`\n🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻 END ROUTES 🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻\n`);
}
