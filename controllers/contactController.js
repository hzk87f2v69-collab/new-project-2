const Contact = require("../models/Contact");

const createInquiry = async (req, res) => {
  const inquiry = await Contact.create(req.body);

  res.status(201).json({
    message: "Your inquiry has been received. Our team will contact you shortly.",
    inquiryId: inquiry._id
  });
};

module.exports = {
  createInquiry
};
