import express from 'express';
const router = express.Router();

import {
    searchHandler,
    ticketsHandler,
} from '../controllers/searchController.js';

// SEARCH
router.get('/search', searchHandler);

router.get('/tickets', ticketsHandler);

export default router;
