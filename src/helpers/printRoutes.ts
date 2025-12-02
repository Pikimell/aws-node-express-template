import { Application } from "express";

type RouteLayer = {
  route?: { path?: string; methods: Record<string, boolean> };
  name?: string;
  handle?: { stack?: RouteLayer[] };
  regexp?: RegExp;
};

export function printRoutes(app: Application, server = "http://localhost:3000") {
  const stack: RouteLayer[] | undefined = (app as unknown as { _router?: { stack?: RouteLayer[] } })._router?.stack;
  if (!stack?.length) {
    return;
  }

  console.log(`\n🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺 ROUTES 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺\n`);

  const walk = (layers: RouteLayer[], prefix = "") => {
    layers.forEach((layer) => {
      if (layer.route?.path) {
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

  walk(stack);

  console.log(`\n🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻 END ROUTES 🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻\n`);
}
