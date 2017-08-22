import { audioCtx } from './sampler.js';

// Generate white-noise array for testing purposes.
function generateTestArray(arrayLength, max, min) {
	let testArray = [];
	for (let i = 0; i < arrayLength; i++) {
		testArray.push(Math.random() * (max - min) + min);
	}
	return testArray;
}

// Sample Rate
const SAMPLE_RATE = audioCtx.sampleRate;

// General Norlization Modes
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
};

export function includeCrossfade(sample) {
	const crossfadingAudioBuffer = audioCtx.createBuffer(2, (sample.loopEnd + sample.crossfade) * audioCtx.sampleRate, SAMPLE_RATE);

	for (let channel = 0; channel < sample.buffer.numberOfChannels; channel++) {
		const crossfadingArrayBuffer = genPlaybackBuffer(sample.buffer.getChannelData(channel), sample.loopStart, sample.loopEnd, sample.crossfade);
		crossfadingAudioBuffer.copyToChannel(crossfadingArrayBuffer, channel);
	}

	sample.buffer = crossfadingAudioBuffer;
}

// Pre-process the sample for playback
function genPlaybackBuffer(bufferArray, loopStart, loopEnd, crossfade) {
	// console.log(bufferArray);
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

	// Copy section to be faded in to end of buffer -> This makes summing easier
	for (let i = loopStart - crossfade; i < loopStart; i++) {
		tempBuffer[i + (loopEnd - loopStart)] = processedBuffer[i];
	}

	// Compute
	linearRamp(tempBuffer, loopEnd - crossfade, loopEnd, 1, 0);
	linearRamp(processedBuffer, loopEnd - crossfade, loopEnd, 0, 1);

	// // Sum fades
	for (let i = loopEnd - crossfade; i < loopEnd; i++) {
		processedBuffer[i] = processedBuffer[i] + tempBuffer[i];
	}

	return Float32Array.from(processedBuffer);

}

function secondsToSamples(seconds) {
	return seconds * SAMPLE_RATE
}

// Simple slope intercept calculation
function linearRamp(bufferArray, startPositionInSamples, endPositionInSamples, startValue, endValue) {
	let m = (endValue - startValue) / (endPositionInSamples - startPositionInSamples);
	let b = endValue - (m * endPositionInSamples);
	for (let i = startPositionInSamples; i < endPositionInSamples; i++) {
		bufferArray[i] = bufferArray[i] * (m * i + b);
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
