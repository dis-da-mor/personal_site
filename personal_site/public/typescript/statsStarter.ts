const modelUrl = `${window.location.origin}/model/model.json`;

async function getServerCsv(url: RequestInfo): Promise<string[]>{
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
async function main(){
    const vocab: string[] = await (await fetch("/words/vocab.json")).json();
    if(getWords != undefined){
        await display(getWords);
        return;
    }
    
    const nouns = await getServerCsv("/words/Nouns.csv");
    if (isMobile) {
        await mobile.mainMobile(vocab, nouns, modelUrl);
    }
    else {
        await desktop.mainDesktop(modelUrl, nouns, vocab)
    }

}
main();


