exports.RoleAccess = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `You ${req.user.name} with role ${req.user.role} are not authorized to access this role `,
            })
        }
        next();
    }
}