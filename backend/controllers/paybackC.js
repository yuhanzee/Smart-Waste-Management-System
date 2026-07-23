const Payback = require("../models/paybackM"); 

// Get all requests
const getAllPayback = async (req, res, next) => {
    let paybacks;

    try {
        paybacks = await Payback.find();
    } catch (err) {
        console.log(err);
    }

    // If not found
    if (!paybacks) {
        return res.status(404).json({ message: "paybacks are not found" });
    }

    // Display all the details to the user
    return res.status(200).json({ paybacks});
};

// Add a new request for the payback
const addPayback = async (req, res, next) => {
    const { quantity,  wasteType,bankname, branch, branchCode, accountNumber } = req.body;

    let newPayback;

    try {
        newPayback = new Payback({
            quantity,
            wasteType,
            bankname,
            branch,
            branchCode,
            accountNumber
        });
        await newPayback.save();
    } catch (err) {
        console.log(err);
    }

    // If the request payback is not inserted
    if (!newPayback) {
        return res.status(404).json({ message: "payback not inserted" });
    }

    return res.status(200).json({ Payback: newPayback });
};

// Get payback request by ID
const getByPaybackID = async (req, res, next) => {
    const id = req.params.id;

    let payb;

    try {
        payb = await Payback.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!payb) {
        return res.status(404).json({ message: "request not available" });
    }

    return res.status(200).json({ Payback: payb });
};


exports.getAllPayback=getAllPayback;
exports.addPayback=addPayback;
exports.getByPaybackID=getByPaybackID;