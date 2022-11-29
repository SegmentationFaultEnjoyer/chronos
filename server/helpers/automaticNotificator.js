
const eventsQ = require('../data/pg/EventsQ');
const { sendEventNotification } = require('./sendToMail');
const CronJob = require('cron').CronJob;


module.exports = new CronJob(
	'0 0 0-23 * * *', // every hour
	//'*/2 * * * * *', // every even second
	async function() {
		console.log('here');
		let dbResp = await new eventsQ().New()
		.Get("users.email, events.title, events.start")
		.Join("users_calendars on users_calendars.calendar_id = events.calendar_id")
		.Join("users on users.id = users_calendars.user_id")
		.WhereNeedNotification()
		.Execute(true);
       
		if (dbResp.error) {
			console.log(dbResp.error)
			return
		}
			
		for (i of dbResp) {
			date = new Date()		
			if(!Number(process.env.DISABLE_MAILGUN)) {
				sendEventNotification(i.email, i.title, date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds())
			}
		}

	},
	null,
	true,
	'America/Los_Angeles'
);