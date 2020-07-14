const fetch = require('node-fetch');

exports.handler = async function(event, context, callback) {
	const weather_response = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?q=San Francisco&appid=${process.env.WEATHER_API_KEY}`
	);

	callback(null, {
		statusCode: 200,
		body: await weather_response.text()
	});
};
