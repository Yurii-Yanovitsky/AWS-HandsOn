const allowedGroups = ["Managers"];

exports.restrictToAllowedGroups = (req, res, next) => {
  if (!req.user["cognito:groups"]) {
    res
      .status(403)
      .json({
        error: {
          message:
            "Access forbidden for the user not belonging to any of the user groups.",
        },
      }); // TODO: Change the rest of the error handlers to this json pattern
    return;
  }

  const userGroups = req.user["cognito:groups"];

  if (userGroups?.some((group) => allowedGroups.includes(group))) {
    next();
  } else {
    res
      .status(403)
      .json({ error: { message: "Access forbidden for this user group." } }); // TODO: Change the rest of the error handlers to this json pattern
  }
};
