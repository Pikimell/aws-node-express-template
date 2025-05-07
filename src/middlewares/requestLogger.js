export const requestLogger = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.headers["x-forwarded-for"];
  const userAgent = req.get("user-agent");
  const time = new Date().toISOString();

  console.log(`\n📥 [${time.split("T")[1].split(".")[0]}] ${method} ${url}`);

  next();
};
