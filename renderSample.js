import { audioCtx } from './sampler.js';

const SAMPLE_RATE = audioCtx.sampleRate;

export function includeCrossfade(sample) {
	const crossfadingAudioBuffer = audioCtx.createBuffer(2, sample.loopEnd * audioCtx.sampleRate, SAMPLE_RATE);

	for (let channel = 0; channel < sample.buffer.numberOfChannels; channel++) {
		const crossfadingArrayBuffer = genPlaybackBuffer(sample.buffer.getChannelData(channel), sample.loopStart, sample.loopEnd, sample.crossfade);
		crossfadingAudioBuffer.copyToChannel(crossfadingArrayBuffer, channel);
	}

	sample.buffer = crossfadingAudioBuffer;
}

// Pre-process the sample for playback
function genPlaybackBuffer(bufferArray, loopStart, loopEnd, crossfade) {
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

	// Copy section to be faded in to end of tempBuffer -> This makes summing easier
	for (let i = loopStart - crossfade; i < loopStart; i++) {
		tempBuffer[i + (loopEnd - loopStart)] = processedBuffer[i];
	}

	// Compute
	fadeIn(tempBuffer, loopEnd - crossfade, loopEnd);
	fadeOut(processedBuffer, loopEnd - crossfade, loopEnd);

	// Sum fades
	for (let i = loopEnd - crossfade; i < loopEnd; i++) {
		processedBuffer[i] = processedBuffer[i] + tempBuffer[i];
	}

	return Float32Array.from(processedBuffer);

}

function secondsToSamples(seconds) {
	return Math.round(seconds * SAMPLE_RATE);
}

function fadeIn(bufferArray, startPositionInSamples, endPositionInSamples) {
	for (let i = startPositionInSamples; i < endPositionInSamples; i++) {
		bufferArray[i] = bufferArray[i] * Math.sin(((i - startPositionInSamples) * (Math.PI / ((endPositionInSamples - startPositionInSamples) * 2))));
	}
}

function fadeOut(bufferArray, startPositionInSamples, endPositionInSamples) {
	for (let i = startPositionInSamples; i < endPositionInSamples; i++) {
		bufferArray[i] = bufferArray[i] * Math.cos(((i - startPositionInSamples) * (Math.PI / ((endPositionInSamples - startPositionInSamples) * 2))));
	}
}
