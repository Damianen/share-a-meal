export const notFound = (req, res, next) => {
    res.status(404).send({
        status: 404,
        message: "404 page not found",
        data: {}
    });
}