import * as passport from 'passport';
import http from 'http';

// @types definitions for passport assume everyone in the world uses express.  :P
declare module 'passport' {
    interface Strategy {
        authenticate(this: passport.StrategyCreated<this>, req: http.IncomingMessage, options?: any): any;
    }
}
