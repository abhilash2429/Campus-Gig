const express = require("express");

const { getPublicColleges } = require("../controllers/adminSuperController");

const router = express.Router();

router.get("/colleges", getPublicColleges);

module.exports = router;
