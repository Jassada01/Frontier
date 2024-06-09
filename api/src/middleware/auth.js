const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET; // ควรเปลี่ยนเป็นค่า secret key ที่ปลอดภัย

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  // console.log(token);
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      res.send({
        user_id: user.user_id,
        display_name: user.display_name,
        position: user.position,
        language: user.language,
        image: user.image,
      });
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = authenticateJWT;
