"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = (millis) => new Promise(resolve => setTimeout(resolve, millis));
