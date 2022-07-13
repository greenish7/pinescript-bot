import express, { Request, Response } from 'express';
import { check } from 'express-validator';
import { placeNewOrder } from '../../controller';

const router = express.Router();

router.post(
  '/new',
  [
    check('symbol', 'please provide asset symbol').not().isEmpty(),
    check('side', 'please provide side').not().isEmpty(),
    check('close', 'please provide close').not().isEmpty(),
    check('token', 'please provide token').not().isEmpty(),
  ],
  placeNewOrder
);

module.exports = router;
