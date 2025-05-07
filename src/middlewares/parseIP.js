import useragent from "useragent";

export const parseIP = (req, res, next) => {
  try {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;
    req.userIP = ip;
    next();
  } catch (err) {
    next(err);
  }
};
