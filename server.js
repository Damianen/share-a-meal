import express from 'express';
import logger from './src/logger.js';
import userRoutes from './src/routes/user.routes.js';
import mealRouter from './src/routes/meal.routes.js';

const app = express();
const port = 8080;
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1> Hi welcome to my site </h1>');
})

app.use(userRoutes);
app.use(mealRouter);

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

app.get('/api/info', (req, res, next) => {
    res.json({
        status: 200,
        message: "System info",
        data: {
            studentName: "Damian Buskens",
            studentNumber: 2206799,
            description: "To help social connection we want to share meals with this site its possible!",
        }
    });
});

export default app;