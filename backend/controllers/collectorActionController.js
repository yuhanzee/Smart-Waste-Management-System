const CollectorAction = require("../models/CollectorAction");
const WasteRecord = require("../models/WasteRecord"); 

exports.logAction = async (req, res) => {
  try {
    const { collectorName, binName, city, wasteType, quantity } = req.body;

    const newAction = new CollectorAction({
      collectorName,
      binName,
      city,
      wasteType,
      quantity,
    });
    await newAction.save();

    await WasteRecord.create({
      area: city || "Unknown",
      wasteType: wasteType || "Other",
      quantity: quantity || 0,
      collectionDate: new Date(),
    });

    res.status(201).json({
      message: "Collector action and waste record logged successfully",
      newAction,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllActions = async (req, res) => {
  try {
    const actions = await CollectorAction.find().sort({ createdAt: -1 });
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActionsByCollector = async (req, res) => {
  try {
    const { collectorName } = req.params;
    const actions = await CollectorAction.find({ collectorName }).sort({
      createdAt: -1,
    });
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
