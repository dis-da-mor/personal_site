"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsUI = void 0;
var statsCipher_js_1 = require("./statsCipher.js");
var randomLimits = [0, 1];
var randomDefault = randomLimits.reduce(function (a, b) { return a + b; }) / randomLimits.length;
var green = "#3cc95d";
var red = "#c03923";
var colours = [green, red, "#1d6bb9", "#cc9b40"];
var randomColour = function () { return colours[Math.floor(Math.random() * colours.length)]; };
function showError(message) {
    var errorHeading = document.createElement("h1");
    errorHeading.className = "main-paragraph";
    errorHeading.style.color = "red";
    errorHeading.style.textAlign = "center";
    errorHeading.innerHTML = "An error occurred: ".concat(message, ".");
    document.body.prepend(errorHeading);
    throw new Error(message);
}
function get(id) {
    var element = document.getElementById(id);
    if (element === undefined) {
        showError("could not find element by id ".concat(id));
    }
    return element;
}
var showElement = function (element) { return element.style.removeProperty("display"); };
var hideElement = function (element) { return element.style.display = "none"; };
var helpButton = get("help");
var helpBlocker = get("help-blocker");
hideElement(helpBlocker);
var okButton = get("ok");
helpButton.onclick = function () { return showElement(helpBlocker); };
okButton.onclick = function () { return hideElement(helpBlocker); };
var loadingScreen = get("loading-blocker");
hideElement(loadingScreen);
var loadingSuggestion = get("loading-suggestion");
hideElement(loadingSuggestion);
function enableLoadingSuggestion(onclick) {
    showElement(loadingSuggestion);
    loadingSuggestion.addEventListener("click", function () {
        hideElement(loadingSuggestion);
        onclick();
    });
}
var generateScreen = get("generate-parent");
hideElement(generateScreen);
function toggleLoadingScreen(on) {
    showElement(on ? loadingScreen : generateScreen);
    hideElement(on ? generateScreen : loadingScreen);
}
var loadingText = get("loading-text");
var setLoadingText = function (text) { return loadingText.innerHTML = text; };
var generateButton = get("generate-button");
var buttonText = get("button-text");
var buttonSpinner = get("generate-spinner");
var generateText = get("generate-text");
var generateTexts = Object.freeze(Array.from([0, 3, 5], function (number) { return generateText.children[number]; }));
var setOnGenerate = function (generate) { return generateButton.addEventListener("click", function () { return generate(); }); };
function toggleGenerate(on) {
    generateButton.disabled = !on;
    buttonText.innerHTML = on ? "Generate!" : "Loading...";
    var action = on ? hideElement : showElement;
    action(buttonSpinner);
}
function setGenerateText(percentage, noun, adjective) {
    var parsedPercentage = typeof percentage == "number" ? percentage : parseInt(percentage, 10);
    if (!isNaN(parsedPercentage)) {
        generateTexts[0].style.color = parsedPercentage > 50 ? green : red;
    }
    generateTexts[0].innerHTML = percentage.toString();
    var underlinedIndex = Math.round(Math.random()) + 1;
    var boldIndex = underlinedIndex == 1 ? 2 : 1;
    generateTexts[underlinedIndex].style.textDecoration = "underline";
    generateTexts[underlinedIndex].style.removeProperty("font-weight");
    generateTexts[boldIndex].style.fontWeight = "bold";
    generateTexts[boldIndex].style.removeProperty("text-decoration");
    generateTexts[1].innerHTML = noun;
    //console.log(generateTexts[2].);
    generateTexts[2].children[0].innerHTML = adjective;
    [1, 2].forEach(function (index) { return generateTexts[index].style.color = randomColour(); });
}
var generateFor = get("generate-for");
var clearGenerateFor = get("clear");
clearGenerateFor.onclick = function () { return generateFor.value = ""; };
var getEnteredValue = function () { return generateFor.value == "" ? undefined : generateFor.value; };
var randomnessSlider = get("randomness-slider");
randomnessSlider.step = Number.MIN_VALUE.toString();
randomnessSlider.min = randomLimits[0].toString(10);
randomnessSlider.max = randomLimits[1].toString(10);
randomnessSlider.value = randomDefault.toString(10);
var randomnessValue = function () { return parseInt(randomnessSlider.value, 10); };
var citeButton = get("cite");
citeButton.onclick = function () {
    if (!navigator.clipboard) {
        toastr.error("Could not copy, clipboard disabled.");
        return;
    }
    var texts = Array.from(generateTexts, function (element) { return element.innerText; });
    var encodedWords = Array.from(texts, function (text) { return (0, statsCipher_js_1.encode)(text); }).join(",");
    toastr.info("Link copied to clipboard!");
    navigator.clipboard.writeText("".concat(window.location.origin).concat(window.location.pathname, "?id=").concat(encodedWords));
};
exports.statsUI = {
    randomnessValue: randomnessValue,
    getEnteredValue: getEnteredValue,
    setGenerateText: setGenerateText,
    setLoadingText: setLoadingText,
    setOnGenerate: setOnGenerate,
    toggleGenerate: toggleGenerate,
    enableLoadingSuggestion: enableLoadingSuggestion,
    toggleLoadingScreen: toggleLoadingScreen
};
//# sourceMappingURL=statsUI.js.map