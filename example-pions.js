'use strict';

// Example to work with https://github.com/pions/webrtc

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const nodertc = require('.');

const webrtc = nodertc({
  certificate: fs.readFileSync(path.resolve('fixtures/certificate.pem')),
  certificatePrivateKey: fs.readFileSync(path.resolve('fixtures/private.pem')),
});

const stdin = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

stdin.once('line', async line => {
  stdin.pause();

  const offer = Buffer.from(line, 'base64').toString();
  console.log('[rtc] got offer\n', offer);

  const session = webrtc.createSession();
  const answer = await session.createAnswer(offer);

  console.log('[rtc] create answer\n', answer);
  console.log(Buffer.from(answer).toString('base64'));
  session.once('channel', channel => {
    console.log('[nodertc] got channel %s', channel.label);
  
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    rl.on('line', line => {
      channel.write(line);
    });
  
    channel.on('data', data => {
      console.log(`${data.toString()}`);
  
      rl.prompt();
    });
  });
});

webrtc.once('ready', () => {
  console.log('[rtc] paste base64-encoded SDP here');

  stdin.prompt();
});


webrtc.start();
