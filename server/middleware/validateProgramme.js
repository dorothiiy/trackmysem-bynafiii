// Middleware to validate that the requested programme matches the user's enrolled programme
export const validateProgrammeAccess = (req, res, next) => {
    const requestedProgramme = req.query.programme || req.params.programmeSlug;
    const userProgramme = req.user.programmeSlug;

    if (!userProgramme) {
        return res.status(400).json({
            error: 'User programme not set. Please complete registration.'
        });
    }

    if (requestedProgramme && requestedProgramme !== userProgramme) {
        return res.status(403).json({
            error: 'Access denied: You can only access data for your enrolled programme',
            userProgramme,
            requestedProgramme
        });
    }

    next();
};
