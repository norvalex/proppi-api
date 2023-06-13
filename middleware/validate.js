module.exports = (validator, requestType) => {
  return (req, res, next) => {
    const { error } = validator(req.body, requestType);
    if (error) return res.status(400).send(error.details[0].message);

    next();
  };
};
