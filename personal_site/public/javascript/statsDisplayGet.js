System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    async function display(getWords) {
        const ui = (await context_1.import("./statsUI.js")).statsUI;
        ui.toggleGenerate(true);
        ui.setOnGenerate(() => window.location.href = window.location.origin + window.location.pathname);
        ui.toggleLoadingScreen(false);
        ui.setGenerateText(getWords[0], getWords[1], getWords[2]);
    }
    exports_1("display", display);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=statsDisplayGet.js.map