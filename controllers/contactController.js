const Contact = require("../models/Contact");
const { isDatabaseConnected } = require("../utils/runtimeState");
const mockStore = require("../utils/mockStore");

const createInquiry = async (req, res) => {
  const inquiry = isDatabaseConnected() ? await Contact.create(req.body) : mockStore.createInquiry(req.body);

  res.status(201).json({
    message: "Your inquiry has been received. Our team will contact you shortly.",
    inquiryId: inquiry._id
  });
};

module.exports = {
  createInquiry
};
