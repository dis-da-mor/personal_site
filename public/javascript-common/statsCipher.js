"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.decode = decode;
exports.validateEncoded = validateEncoded;
const SPACE_REPLACER = "-";
const SPACE = " ";
const lowercaseStart = "a".charCodeAt(0);
const lowercaseEnd = "z".charCodeAt(0);
const lowercaseLetters = Array.from({ length: lowercaseEnd - lowercaseStart + 1 }, (_, index) => String.fromCharCode(lowercaseStart + index));
const shift = (arr, k) => arr.slice(k).concat(arr.slice(0, k));
const shiftedLetters = shift(lowercaseLetters, 10);
function isAlpha(char) {
    return char.match(/[a-z]/i);
}
function isLower(char) {
    return char == char.toLowerCase();
}
function encode(original) {
    const cleaned = original.replaceAll(SPACE, SPACE_REPLACER).toLowerCase();
    return Array.from(cleaned, (char) => {
        if (!lowercaseLetters.includes(char))
            return char;
        return shiftedLetters[lowercaseLetters.indexOf(char)];
    }).join("");
}
function decode(original) {
    return Array.from(original, (char) => {
        if (char == SPACE_REPLACER)
            return SPACE;
        if (!shiftedLetters.includes(char))
            return char;
        return lowercaseLetters[shiftedLetters.indexOf(char)];
    }).join("");
}
function validateEncoded(word) {
    const wordArray = word.split("");
    return (wordArray.every((char) => !isAlpha(char) || isLower(char)));
}
//# sourceMappingURL=statsCipher.js.map