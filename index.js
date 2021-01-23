const Lights = require('./Lights');
const config = require('./tally.config.json');
const { Atem } = require('atem-connection');

const switcher = new Atem();
const lights = new Lights(config.leds);

// Flash to indicate the tally is currently disconnected
lights.startFlashing(config.disconnectedFlashBrightness, config.disconnectedFlashFrequency);

console.log("Connecting...");
switcher.connect(config.switcherIP);

switcher.on('connected', () => {
	console.log("Connected.");
	lights.stopFlashing();
	lights.off();
});

switcher.on('disconnected', () => {
	console.log("Lost connection!");
	// Flash to indicate the tally is currently disconnected
	lights.startFlashing(config.disconnectedFlashBrightness, config.disconnectedFlashFrequency); //
});

switcher.on('stateChanged', (state) => {
	// State does not always contain ME video data; Return if necessary data is missing.
	if(!state || !state.video || !state.video.ME || !state.video.ME[0])
		return;

	// const preview = state.video.ME[0].previewInput;
	const program = state.video.ME[0].programInput;

	// If faded to black, lights are always off
	if(state.video.ME[0].fadeToBlack && state.video.ME[0].fadeToBlack.isFullyBlack) {
		lights.off();
	// This camera is either in program OR preview, and there is an ongoing transition.
	} else{

		for(var i=0; i<config.leds.length; i++) {
			if(program === config.leds[i].inputID) {
				lights.ledOn(i); 
			}else{
				lights.off(i);
			}
		}
	}
});
