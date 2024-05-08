import express from 'express';
import logger from './src/logger.js';
import userRoutes from './src/routes/user.routes.js';

const app = express();
const port = 8080;
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1> Hi welcome to my site </h1>');
})

app.use(userRoutes);

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    });
});

export default app;