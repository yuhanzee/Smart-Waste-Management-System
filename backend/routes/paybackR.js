const express = require("express");
const router = express.Router();

// Controller
const Payback = require("../controllers/paybackC");


// Routes
router.get("/",Payback.getAllPayback);
router.post("/",Payback.addPayback);
router.get("/:id",Payback.getByPaybackID);

module.exports=router;