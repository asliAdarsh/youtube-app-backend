import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js"

const healthcheckrouter = Router();

healthcheckrouter.route('/').get(healthcheck);

export default healthcheckrouter