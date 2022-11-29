require("dotenv").config();

const formData = require('form-data');
const Mailgun = require('mailgun.js');

let mg;

let domen;

function initMailGun() {
    domen = process.env.MAILGUN_DOMEN;

    const mailgun = new Mailgun(formData);

    mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
    });
    console.log('mailgun started');
}

async function sendMail(to, subject, text) {
    try {
        await mg.messages.create(domen, 
            {
                from: `Chronos Support <postmaster@${process.env.MAILGUN_DOMEN}>`,
                to: [to],
                subject,
                text,
                html: `<a href="${text}">Reset Link</a>`
            })
    } catch (error) {
        console.error(error.message);
        throw new Error('Mail service currently unavailable');
    }
}

async function sendEventNotification(to, eventTitle, time) {
    try {
        await mg.messages.create(domen, 
            {
                from: `Chronos Support <postmaster@${process.env.MAILGUN_DOMEN}>`,
                to: [to],
                subject: `${eventTitle} is starting soon!`,
                text: `Hi
Event ${eventTitle} is startin in ${time}. Don't forget about it!`,
                html: `<a href="http://localhost:${process.env.CLIENT_PORT}/event/">Event Link</a>`
            })
    } catch (error) {
        console.error(error.message);
        throw new Error('Mail service currently unavailable');
    }
}
async function sendAddToCalendarNotification(to, calendarTitle, role, calendar_id) {
    try {
        await mg.messages.create(domen, 
            {
                from: `Chronos Support <postmaster@${process.env.MAILGUN_DOMEN}>`,
                to: [to],
                subject: `${calendarTitle} permissions`,
                text: `Hi
You have new permissions as ${role} in ${calendarTitle} calendar`,
                html: `<a href="http://localhost:${process.env.CLIENT_PORT}/calendar/${calendar_id}">Calendar Link</a>`
            })
    } catch (error) {
        console.error(error.message);
        throw new Error('Mail service currently unavailable');
    }
}
module.exports = { sendMail, sendEventNotification,initMailGun, sendAddToCalendarNotification }