const errorMiddleware = (err, req, res, next) => {
    if (!(err instanceof Error)) {
        err = new Error(typeof err === "string" ? err : "Internal Server Error");
    }

    err.statusCode = err.statusCode ||
        (err.code === "LIMIT_FILE_SIZE" ? 413 : err.name === "MulterError" ? 400 : 500);

    err.status = err.status || "error";

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.statusCode >= 500
            ? (process.env.NODE_ENV !== "production" || err.expose ? err.message : "Internal server error")
            : err.message,
        ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    });

};

export default errorMiddleware;