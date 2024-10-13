"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEncoded = exports.decode = exports.encode = void 0;
var SPACE_REPLACER = "-";
var SPACE = " ";
var lowercaseStart = "a".charCodeAt(0);
var lowercaseEnd = "z".charCodeAt(0);
var lowercaseLetters = Array.from({ length: lowercaseEnd - lowercaseStart + 1 }, function (_, index) { return String.fromCharCode(lowercaseStart + index); });
var shift = function (arr, k) { return arr.slice(k).concat(arr.slice(0, k)); };
var shiftedLetters = shift(lowercaseLetters, 10);
function isAlpha(char) {
    return char.match(/[a-z]/i);
}
function isLower(char) {
    return char == char.toLowerCase();
}
function encode(original) {
    var cleaned = original.replace(SPACE, SPACE_REPLACER).toLowerCase();
    return Array.from(cleaned, function (char) {
        if (!lowercaseLetters.includes(char))
            return char;
        return shiftedLetters[lowercaseLetters.indexOf(char)];
    }).join("");
}
exports.encode = encode;
function decode(original) {
    return Array.from(original, function (char) {
        if (char == SPACE_REPLACER)
            return SPACE;
        if (!shiftedLetters.includes(char))
            return char;
        return lowercaseLetters[shiftedLetters.indexOf(char)];
    }).join("");
}
exports.decode = decode;
function validateEncoded(word) {
    var wordArray = word.split("");
    return (wordArray.every(function (char) { return !isAlpha(char) || isLower(char); }));
}
exports.validateEncoded = validateEncoded;
//# sourceMappingURL=statsCipher.js.map