const { envConfig } = require('../config/env.config');

const accountSid = envConfig.TWILIO_ACCOUNT_SID;
const authToken = envConfig.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendSms = async (data) => {
  try {
    const message = await client.messages.create({
      body: data.body,
      from: envConfig.TWILIO_SENDER_NUMBER,
      to: data.to,
    });
    console.log(message.sid);
    return message?.sid;
  } catch (error) {
    console.error('*** SENDGRID ERROR ***', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return 0;
  }
};

module.exports = { sendSms };
