import { expect } from 'chai';
import 'mocha';
import * as passport from 'passport';
import { Strategy } from 'passport-strategy';
import { runStrategy } from '../src/runner';

class TestStrategy extends Strategy {
    private readonly fn : (req: object, options: object) => void;

    constructor(fn: (req: object, options: object) => void) {
        super();
        this.fn = fn;
    }
    authenticate(req: any, options: any) {
        return this.fn.call(this, req, options);
    }
}

const OPTIONS = {options: true};

const USER = {username: 'dave'};
const INFO = {info: 'info'};

describe('running strategies', function() {
    beforeEach(function() {
        this.req = {};
    });

    describe('basic functionality', function() {
        it('should run a strategy that logs in a user', async function() {
            const successStrategy = new TestStrategy(function(this: passport.StrategyCreated<any>, req: any) {
                if(req.info) {
                    this.success(USER, INFO);
                } else {
                    this.success(USER);
                }
            });

            this.req.info = true;
            expect(await runStrategy(successStrategy, this.req, OPTIONS))
                .to.eql({type: 'success', user: USER, info: INFO});

            this.req.info = false;
            expect(await runStrategy(successStrategy, this.req, OPTIONS))
                .to.eql({type: 'success', user: USER, info: undefined});
        });

        it('should run a strategy that fails a user', async function() {
            const successStrategy = new TestStrategy(function(this: passport.StrategyCreated<any>, req: any) {
                if(req.fail === 'challenge') {
                    this.fail('challenge!');
                } else if(req.fail === 'challenge+status') {
                    this.fail('challenge!', 404);
                } else if(req.fail === 'status') {
                    this.fail(404);
                } else {
                    this.fail();
                }
            });

            this.req.fail = 'challenge';
            expect(await runStrategy(successStrategy, this.req, OPTIONS), this.req.fail)
                .to.eql({type: 'fail', challenge: 'challenge!', status: undefined});

            this.req.fail = 'challenge+status';
            expect(await runStrategy(successStrategy, this.req, OPTIONS), this.req.fail)
                .to.eql({type: 'fail', challenge: 'challenge!', status: 404});

            this.req.fail = 'status';
            expect(await runStrategy(successStrategy, this.req, OPTIONS), this.req.fail)
                .to.eql({type: 'fail', challenge: undefined, status: 404});

            this.req.fail = 'none';
            expect(await runStrategy(successStrategy, this.req, OPTIONS), this.req.fail)
                .to.eql({type: 'fail', challenge: undefined, status: undefined});
        });

        it('should run a strategy that redirects a user', async function() {
            const successStrategy = new TestStrategy(function(this: passport.StrategyCreated<any>, req: any) {
                if(req.redirect === 'status') {
                    this.redirect('url', 301);
                } else {
                    this.redirect('url');
                }
            });

            this.req.redirect = 'status';
            expect(await runStrategy(successStrategy, this.req, OPTIONS))
                .to.eql({type: 'redirect', url: 'url', status: 301});

            this.req.redirect = 'nostatus';
            expect(await runStrategy(successStrategy, this.req, OPTIONS))
                .to.eql({type: 'redirect', url: 'url', status: 302});
        });

        it('should run a strategy that passes', async function() {
            const successStrategy = new TestStrategy(function(this: passport.StrategyCreated<any>) {
                this.pass();
            });
            expect(await runStrategy(successStrategy, this.req, OPTIONS)).to.eql({type: 'pass'});
        });

        it('should run a strategy that throws an error', async function() {
            const successStrategy = new TestStrategy(function(this: passport.StrategyCreated<any>) {
                this.error(new Error('boom'));
            });

            try {
                await runStrategy(successStrategy, this.req, OPTIONS);
                expect.fail('Expected an error but passed.');
            } catch (err) {
                expect(err.message).to.equal('boom');
            }
        });
    });

    describe('callbacks', function() {
        it('should work with a callback', function(done) {
            const successStrategy = new TestStrategy(function(this: passport.StrategyCreated<any>) {
                this.success(USER);
            });

            runStrategy(successStrategy, this.req, OPTIONS, (err, result) => {
                if(err) {
                    return done(err);
                }
                try {
                    expect(result).to.eql({type: 'success', user: USER, info: undefined});
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });

        it('should work with a callback and no options', function(done) {
            const successStrategy = new TestStrategy(function(this: passport.StrategyCreated<any>) {
                this.success(USER);
            });

            runStrategy(successStrategy, this.req, (err, result) => {
                if(err) {
                    return done(err);
                }
                try {
                    expect(result).to.eql({type: 'success', user: USER, info: undefined});
                    done();
                } catch(err) {
                    done(err);
                }
            });
        });
    });
});
