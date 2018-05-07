import http from 'http';
import * as passport from 'passport';
import pb from 'promise-breaker';
import './passportFix';

export interface StrategySuccessResult {
    type: 'success';
    user: object;
    info: object | undefined;
}

export interface StrategyFailResult {
    type: 'fail';
    challenge: string | undefined;
    status: number | undefined;
}

export interface StrategyRedirectResult {
    type: 'redirect';
    url: string;
    status: number;
}

export interface StrategyPassResult {
    type: 'pass';
}

export type StrategyResult =
    StrategySuccessResult |
    StrategyFailResult |
    StrategyRedirectResult |
    StrategyPassResult;

export type StrategyRunnerCallback = ( err: any, result?: StrategyResult ) => void;

/**
 * Run a Passport strategy.
 *
 * @param strategy - The strategy to run.
 * @param req - The request to run the strategy on.
 * @param options - Options to pass to the strategy.
 * @param done - Callback to call with the result.  The result will be an
 *   object of one of the following forms:
 *
 *   * `{type: 'success', user, info}`
 *   * `{type: 'fail', challenge, status}`
 *   * `{type: 'redirect', url, status}`
 *   * `{type: 'pass'}`
 *
 */
export function runStrategy<T extends passport.Strategy>(
    strategy: T,
    req: http.IncomingMessage,
    options: object,
    done: StrategyRunnerCallback
) : void;

/**
 * Run a Passport strategy.
 *
 * @param strategy - The strategy to run.
 * @param req - The request to run the strategy on.
 * @param done - Callback to call with the result.  The result will be an
 *   object of one of the following forms:
 *
 *   * `{type: 'success', user, info}`
 *   * `{type: 'fail', challenge, status}`
 *   * `{type: 'redirect', url, status}`
 *   * `{type: 'pass'}`
 *
 */
export function runStrategy<T extends passport.Strategy>(
    strategy: T,
    req: http.IncomingMessage,
    done: StrategyRunnerCallback
) : void;

/**
 * Run a Passport strategy.
 *
 * @param strategy - The strategy to run.
 * @param req - The request to run the strategy on.
 * @param options - Options to pass to the strategy.
 * @returns - a StrategyResult.  The returned object will be one of:
 *
 *   * `{type: 'success', user, info}`
 *   * `{type: 'fail', challenge, status}`
 *   * `{type: 'redirect', url, status}`
 *   * `{type: 'pass'}`
 *
 */
export function runStrategy<T extends passport.Strategy>(
    strategy: T,
    req: http.IncomingMessage,
    options?: object,
) : Promise<StrategyResult>;

export function runStrategy<T extends passport.Strategy>(
    strategy: T,
    req: http.IncomingMessage,
    options?: object | StrategyRunnerCallback,
    done?: StrategyRunnerCallback
) : Promise<StrategyResult> | void {
    if(!done && typeof options === 'function') {
        done = options;
        options = {};
    }

    return pb.addPromise<StrategyResult>(done, (done: StrategyRunnerCallback) => {
        const runInstance: passport.StrategyCreated<T> = Object.create(strategy);

        runInstance.success = (user, info) => {
            done(null, {type: 'success', user, info});
        };

        runInstance.fail = (challenge, status) => {
            if (typeof challenge === 'number') {
                status = challenge;
                challenge = undefined;
            }
            done(null, {type: 'fail', challenge, status});
        };

        runInstance.redirect = (url, status) => {
            done(null, {type: 'redirect', url, status: status || 302});
        };

        runInstance.pass = () => {
            done(null, {type: 'pass'});
        };

        runInstance.error = (err) => {
            done(err);
        };

        runInstance.authenticate(req, options);
    });
}