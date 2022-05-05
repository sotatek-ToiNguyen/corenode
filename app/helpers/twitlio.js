const twilio = require('twilio');
const pkg = require('google-libphonenumber');
const { PhoneNumberUtil, PhoneNumberFormat } = pkg;

/**
 * @param {string} bodySMS
 * @param {string} toPhoneNumber
 * @return {Promise<MessageInstance>}
 */
sendMessageSMSByTwilio = async(bodySMS, toPhoneNumber) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_ID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        const client = twilio(accountSid, authToken);
        const phoneUtil = PhoneNumberUtil.getInstance();
        toPhoneNumber = phoneUtil.parseAndKeepRawInput(toPhoneNumber, process.env.COUNTRY_CODE);
        toPhoneNumber = phoneUtil.format(toPhoneNumber, PhoneNumberFormat.E164);
        return await client.messages.create({
            from:  process.env.SMS_PHONE,
            to: toPhoneNumber,
            body: bodySMS
        });
    } catch (e) {
        throw new Error(`${e.code} -- ${e.message} -- ${e.moreInfo}`);
    }
}
module.exports = {sendMessageSMSByTwilio}