import 'event-source-polyfill';
import { polyfill as polyfillEs6Promise } from 'es6-promise';

polyfillEs6Promise();

// required by extracted-loader
if (NodeList && !(NodeList.prototype as any).forEach) {
    (NodeList.prototype as any).forEach = function (callback: any, thisArg: any) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

if (!Math.trunc) {
    Math.trunc = function (v: number) {
        v = +v;
        return (v - v % 1) || (!isFinite(v) || v === 0 ? v : v < 0 ? -0 : 0);
    };
}
