export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.code = err.code || 'INTERNAL_ERROR';

    // Development Environment: Expose stack traces for rapid debugging
    if (process.env.NODE_ENV !== 'production') {
        console.error("🔥 Error Captured:", err);
        return res.status(err.statusCode).json({
            data: null,
            meta: null,
            errors: [{
                code: err.code,
                message: err.message,
                stack: err.stack
            }]
        });
    }

    // Production Environment: Hide raw stack traces from the client for pure operational crashes
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            data: null,
            meta: null,
            errors: [{ code: err.code, message: err.message }]
        });
    }

    // Unhandled / Codematic Error in Production -> Don't leak systemic details to clients
    console.error("🔥 FATAL INTERNAL ERROR:", err);
    return res.status(500).json({
        data: null,
        meta: null,
        errors: [{ code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' }]
    });
};
