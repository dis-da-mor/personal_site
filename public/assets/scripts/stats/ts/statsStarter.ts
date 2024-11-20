const getModelUrl = (mobile) => {
    let name = mobile ? "ConvertedMobile" : "Converted";
    return `${window.location.origin}/assets/${name}/model.json`
}

async function getServerCsv(url){
    const result = await fetch(url);
    const csv = await result.text();
    const array = csv.split("\n")
    const cleaned = array.slice(1).map(word => word.replace("\r", ""));
    return Promise.resolve(cleaned);
}

import {display} from "./statsDisplayGet.js";
import * as mobile from "./statsMobile.js";
import * as desktop from "./statsDesktop.js";

declare const getWords: undefined|Array<string>;
declare const isMobile: boolean;
declare const isChrome: boolean;

async function main(){
    const vocab = await (await fetch("/assets/vocab.json")).json();
    if(getWords != undefined){
        await display(getWords);
        return;
    }

    const nouns = await getServerCsv("/assets/words/Nouns.csv");
    if (isMobile || !isChrome) {
        const version = isMobile ? "Mobile" : "Non-Chrome";
        await mobile.mainMobile(vocab, nouns, getModelUrl(true), version);
    }
    else {
        await desktop.mainDesktop(getModelUrl, nouns, vocab)
    }

}
main();


