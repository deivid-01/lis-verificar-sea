const express = require('express');
const router = express.Router();

const validation =require('../controller/validation.controller')

router.post('/verificarrequisitossea',validation.Validate)

module.exports= router;