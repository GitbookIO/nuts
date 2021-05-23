const BACKENDS = {
  github: require("./github"),
};

module.exports = function (backend) {
  if (typeof backend === "string") return BACKENDS[backend];
  return backend;
};
