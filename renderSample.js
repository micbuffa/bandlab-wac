// Generate white-noise array for testing purposes.
function generateTestArray(arrayLength, max, min) {
	for (let i = 0; i < arrayLength; i++) {
		testArray.push(Math.random() * (max - min) + min);
	}
}

// General Norlization Modes
const SAMPLE_RATE = 44100;

const NORMALIZE = {
	"basic": function(bufferArray) {
		for (let i = 0; i < bufferArray.length; i++) {
			bufferArray[i] = bufferArray[i] * calcNormCoef(bufferArray);
		}
	},
	"ifClipping": function(bufferArray) {
		if (bufferMax(bufferArray) > 1) {
			for (let i = 0; i < bufferArray.length; i++) {
				bufferArray[i] = bufferArray[i] * calcNormCoef(bufferArray);
			}
		}
	},
	"toDecibelLevel": function(bufferArray, decibelLevel) {
		let coef = calcNormCoef(bufferArray);
		for (let i = 0; i < bufferArray.length; i++) {
			bufferArray[i] = bufferArray[i] * coef * dbToFloat(decibelLevel);
		}
	},
	"toSignalLevel": function(bufferArray, signalLevel) {
		let coef = calcNormCoef(bufferArray);
		for (let i = 0; i < bufferArray.length; i++) {
			bufferArray[i] = bufferArray[i] * coef * signalLevel;
		}
	}
}

export function genPlaybackBuffer(bufferArray, loopStart, loopEnd, crossfade) {
	let processedBuffer = [];

	// Convert loopStart, loopEnd, crossfade to samples for sanity purposes
	loopStart = secondsToSamples(loopStart);
	loopEnd = secondsToSamples(loopEnd);
	crossfade = secondsToSamples(crossfade);

	// Populate processedBuffer to be max length of loopEnd
	for (let i = 0; i < loopEnd; i++) {
		processedBuffer.push(bufferArray[i]);
	}

	// Make a temp buffer to add crossfades at end of sample
	let tempBuffer = [];

	// Apply fade in to end of temp buffer
	for (let i = loopStart - crossfade; i < loopStart; i++) {
		tempBuffer[i + (loopEnd - loopStart)] = processedBuffer[i];
	}

	// Add fades
	linearRamp(tempBuffer, loopEnd - crossfade, tempBuffer.length, 0, 1);
	linearRamp(processedBuffer, loopEnd - crossfade, processedBuffer.length, 1, 0);

	// Sum fades
	for (let i = loopEnd - crossfade; i < processedBuffer.length; i++) {
		processedBuffer[i] = processedBuffer[i] + tempBuffer[i];
	}

	// Normalize to -8 dB to avoide clipping
	NORMALIZE.toDecibelLevel(processedBuffer, -8);

	return processedBuffer;
}


function secondsToSamples(seconds) {
	return seconds * SAMPLE_RATE
}

function linearRamp(bufferArray, startPositionInSamples, endPositionInSamples, startValue, endValue) {
	let m = (endValue - startValue) / (endPositionInSamples - startPositionInSamples);
	let b = endValue - (m * endPositionInSamples);
	for (let i = startPositionInSamples; i < endPositionInSamples; i++) {
		bufferArray[i] = m * i + b;
	}
	return bufferArray;
}

function bufferMax(bufferArray) {
	let max = Math.max.apply(Math, bufferArray);
	let min = Math.min.apply(Math, bufferArray);
	return Math.max(max, Math.abs(min));
}

function dbToFloat(dbValue) {
	return Math.pow(10, (parseFloat(dbValue) * 1 / 20));
}

function calcNormCoef(bufferArray) {
	return 1 / bufferMax(bufferArray);
}
