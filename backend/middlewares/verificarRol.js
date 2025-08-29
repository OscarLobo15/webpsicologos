const jwt = require("jsonwebtoken");

function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      if (!rolesPermitidos.includes(decoded.tipo_usuario)) return res.sendStatus(403);
      req.usuario = decoded;
      next();
    });
  };
}

module.exports = verificarRol;
