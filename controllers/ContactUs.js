const { contactUsEmail } = require("../mail/templates/contactFormRes");
const mailSender = require("../utilities/mailSender");

exports.contactUsController = async (req, res) => {
  const { email, firstname, lastname, message, phoneNo, countrycode } =
    req.body;
  console.log(req.body);
  try {
    const emailhtml = contactUsEmail(
      email, 
      firstname,
      lastname,
      message,
      phoneNo,
      countrycode
    );
    const emailRes = await mailSender(
      email,
      "Contact Form Submission Confirmation",
      emailhtml
    );
    console.log("Email Res ", emailRes);
    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log("Error", error);
    console.log("Error message :", error.message);
    return res.json({
      success: false,
      message: "Something went wrong...",
    });
  }
};
