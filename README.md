### Designing and deploying sample-based instruments

In this tutorial we will run through the process of creating a sample based MIDI instrument utilizing both Web Audio and Web MIDI. We will start by broadly addressing the sound design concepts used to create the individual samples and then techniques for increasing download speed using infinite looping and variable speed playback. We will then define the instrument’s basic user interface.

In the second half of the session we will address both real-time audio effects such as non-convolution reverbs and MIDI effects such as a simple arpeggiator and chord generator.

#### What to bring
Your laptop, with Node.js installed, headphones and a mood for jamming!

#### Duration
90 minutes

#### Presenters
John Ivers, Laurent Le Graverend, Gilles Piou

### Getting started

To start the development server:

```sh
npm install
npm start
```

### Tutorial

#### Sampler

1. Bind keyboard events
2. Play sample files

#### Velocity envelope

1. Connect a gain node
2. Pass velocity parameter

#### Pitch-shift

1. Use pitch-shift formula
2. Parse soundbank JSON

#### Infinite sustain

1. Include crossfade to existing audio buffers
2. Use Web Audio loop feature
