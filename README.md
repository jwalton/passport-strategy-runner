# passport-strategy-runner

[![NPM version](https://badge.fury.io/js/passport-strategy-runner.svg)](https://npmjs.org/package/passport-strategy-runner)
[![Build Status](https://travis-ci.org/jwalton/passport-strategy-runner.svg)](https://travis-ci.org/jwalton/passport-strategy-runner)
[![Coverage Status](https://coveralls.io/repos/jwalton/passport-strategy-runner/badge.svg)](https://coveralls.io/r/jwalton/passport-strategy-runner)
[![Greenkeeper badge](https://badges.greenkeeper.io/jwalton/passport-strategy-runner.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## What is it?

This lets you run a Passport strategy without having Passport involved:

```js
import { BasicStrategy } from 'passport-http';
import { runStrategy } from 'passport-strategy-runner';

const strategy = new BasicStrategy((username, password, done) => {
  done(null, {username: 'jwalton'});
});

const req = {};

// If no callback is supplied, will return a promise.
runStrategy(strategy, req, (err, result) => {
    expect(req.user.username).to.equal('jwalton');
});
```

## Why would you want this?

Maybe you want to write unit tests for your strategy, maybe you want to make
a passport competitor that works with Passport strategies, maybe you just
decided you wanted to figure out how Passport works.  :)

## API

### runStrategy(strategy, request[, options][, done])

Runs the specified strategy, with the specified `request` and the specified `options`.
`options` here is the options object that would be passed to `passport.authenticate(strategy, options)`.
If you do not pass a callback to this function, it will return a Promise which
resolves to the result.  The result will be an object of one of the following
forms:

* `{type: 'success', user, info}`
* `{type: 'fail', challenge, status, message, messageType}`
* `{type: 'redirect', url, status}`
* `{type: 'pass'}`
