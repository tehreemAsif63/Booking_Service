import encryption from "../utilities/crypto-utils"

async function authorizationMiddleware(message:string) {
  /**const ispublic = req.originalUrl.toLowerCase().includes("/public");
  if (ispublic) {
    next();
    return;
  }
  if (!req.headers.authorization) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  try {
    const userid = encryption.decryptToken(req.headers.authorization);
    req.userid = userid;
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  next();*/
}
export default authorizationMiddleware;
