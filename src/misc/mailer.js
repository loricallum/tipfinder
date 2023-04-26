/**
 *
 * @type {{createTransport?: function(*=, *=): *, createTestAccount?: function(*=, *=): (*), getTestMessageUrl?: function(*=): (boolean|string)}}
 */
const nodemailer = require("nodemailer");
/**
 *config module
 *
 * @type {Config}
 */
const Environment   = require("config");

class Mailer
{
    /**
     * class Constructor
     */
    constructor() {
        this.environment = Environment;
        this.enabled = this.environment.mailOptions.enabled;
        this.opts = this.environment.mailOptions.opts;
        this.failEmails = this.environment.mailOptions.failEmails;
        this.from = this.environment.mailOptions.from;
        this.to = this.environment.mailOptions.to;
        this.subject = this.environment.mailOptions.subject;
        this.transporter = nodemailer.createTransport(this.opts);
    }

    /**
     * Send the mail
     *
     * @param body
     * @returns {Promise<void>}
     */
    async send({ body })
    {
        if (this.enabled) {
            await this.transporter.sendMail({
                from: this.from,
                to: this.to,
                subject: this.subject,
                html: `<pre id="json"> ${body} </pre>`
            });
        }
    }
}

module.exports = new Mailer();