import useragent from "useragent";

export const parseDevice = (req, res, next) => {
  try {
    const userAgentHeader = req.headers["user-agent"] || "";
    const agent = useragent.parse(userAgentHeader);

    req.userDevice = agent.device.toString();
    req.userOS = agent.os.toString();
    req.userBrowser = agent.toAgent();
    next();
  } catch (err) {
    next(err);
  }
};
