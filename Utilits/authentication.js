const jwt = require("jsonwebtoken");

exports.isAuth = async (req, res, next) => {
  const { cookies } = req;

  if (cookies.accessToken) {
    let obj = await jwt.verify(cookies.accessToken, process.env.SECRET_KEY);
    // sdfsfgbdeblndv -> { _id: existingUser._id } DECRYPTION
    req._id = obj._id;

    // {
    //   _id: 'asfsgerheheg'
    // }
    if (!obj._id) {
      return res.status(401).send({ message: "Not Authenticated" });
    }
    return next();
  }
  return res.status(401).send({ message: "Not Authenticated" });
};