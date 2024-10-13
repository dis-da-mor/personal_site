const getModelUrl = (isMobile) => {
    let name = isMobile ? "ConvertedMobile" : "Converted";
    return `${window.location.origin}/assets/${name}/model.json`
}
console.log(isMobile);
console.log(getWords);
async function getServerCsv(url){
    let result = await fetch(url);
    let csv = await result.text();
    let array = csv.split("\n");
    array.shift();
    return Promise.resolve(array);
}

function disableLoadingScreen(){
    let loadingScreen = document.getElementById("loading-blocker");
    loadingScreen.style.display = "none";
    let generateScreen = document.getElementById("generate-parent");
    generateScreen.style.removeProperty("display");
}

const MAX_SEQ_LENGTH = 512
const MAX_INPUT_LENGTH = 30
const MASK = "***mask***";
let model = undefined;
let wordLists = []
let tokenizer = undefined;
let optionsIds = [];

let sample = (array, limit=undefined) => {
    limit = limit === undefined? array.length : Math.min(array.length, limit);
    return array[Math.floor(Math.random()*limit)];
}

let cleanInput = (userInput) => {
    userInput = userInput.replace(/[^0-9a-z ]/gi, '');
    if(userInput.length < 1) return undefined;
    if(userInput.length > MAX_INPUT_LENGTH) return userInput.substring(0, MAX_INPUT_LENGTH);
    return userInput;
}

async function generateStat(words, maskIndex, topK){

    if(maskIndex < 0){
        maskIndex = Math.floor(Math.random() * words.length);
    }
    words  = words.map((value, index) => {
        if(index === maskIndex) return MASK;
        return value === undefined ? sample(wordLists[index]) : cleanInput(value);
    });
    let randomPercentage = () => {
        let number = Math.random() * 100;
        return Math.round(number * 10) / 10;
    }

    let percentage = randomPercentage();
    let text = `${percentage}% of ${words[0]} are ${words[1]}`;
    let tokenized = tokenizer.processInput(text, MASK);
    let predictions = model.execute(tokenized.inputs);
    let rankedOptions = tokenizer.processOutput(predictions, tokenized.maskIndex, wordLists[maskIndex], optionsIds[maskIndex]);
    predictions.dispose();
    let limit = Math.min(topK, rankedOptions.length);
    words[maskIndex] = sample(rankedOptions, limit);
    words = words.map((word) => {
        return word.replace(/(\r\n|\n|\r)/gm, "");
    });
    return [percentage, words[0], words[1]];
}

async function load(url, adjectivesJson, nounsJson, vocab){
    model = await tf.loadGraphModel(url);
    let dummyInput = new tf.zeros([1,512], "int32")
    model.execute({
        "input_ids": dummyInput,
        "attention_mask": dummyInput
    });
    dummyInput.dispose();
    tokenizer = new BertTokenizer(true, MAX_SEQ_LENGTH);
    await tokenizer.load(vocab);
    wordLists.push(nounsJson);
    wordLists.push(adjectivesJson);
    optionsIds = Array.from(wordLists, wordList => {
        return Array.from(wordList, word => tokenizer.tokenize(word)[0]);
    });
}

let worker;
let button;
let buttonText;
let buttonSpinner;
let generateText;
let generatedTexts;
let isActive;
let randomnessSlider;
let mobile;

let setActive = (active) => {
    isActive = active;
    button.disabled = !active;
    buttonText.innerHTML = active? "Generate!" : "Loading...";
    if(active) buttonSpinner.style.display = "none";
    else buttonSpinner.style.removeProperty("display");
}

let randomColour = () => {
    let colours = ["#3cc95d", "#c03923", "#1d6bb9", "#cc9b40"];
    return colours[Math.floor(Math.random()*colours.length)];
}

class GeneratedText{
    constructor(htmlElement) {
        this.element = htmlElement;
        this.resizeField = () => {
            this.element.style.width = (Math.min(Math.max(this.element.value.length, 3), 20) + 2) + "ch";
        };
        this.generatedValue = htmlElement.value;
        this.hasChanged = () => {
            return this.generatedValue !== this.element.value;
        }
        this.setGenerated = (content) => {
            this.generatedValue = content;
            this.element.value = content;
            this.element.style.color = randomColour();
            this.resizeField();
        }
        this.element.addEventListener("input", this.resizeField);
        this.resizeField();
    }
}

let nouns;
let adjectives;
let vocab;

let startWorker = (url) => {
    worker = new Worker(new URL('workerModel.js', import.meta.url));

    worker.addEventListener('message', function(e) {
        if(e.data === "loaded"){
            button.onclick = generate;
            setActive(true);

            disableLoadingScreen();
        }
    }, false);

    worker.postMessage(["load", url, adjectives, nouns, vocab]);
}

async function main(){
    let get = (id) => document.getElementById(id);
    button = get("generate-button");
    buttonText = get("button-text");
    buttonSpinner = get("generate-spinner");
    generateText = get("generate-text");
    generatedTexts = Array.from([0, 3, 5], (value, index) => {
        if(index === 0) return generateText.children[value];
        return new GeneratedText(generateText.children[value]);
    });
    randomnessSlider = get("randomness-slider");
    randomnessSlider.min = 4;
    randomnessSlider.max = 80;
    randomnessSlider.value = 20;
    let loadingSuggestion = get("loading-suggestion");
    loadingSuggestion.style.display = "None";

    get("cite").onclick = () => {
        if(!navigator.clipboard) return;
        else alert("clipboard disabled, copy failed");
        let text = `"${generatedTexts[0].innerHTML}% of ${generatedTexts[1].generatedValue} are ${generatedTexts[2].generatedValue}"`;
        let dateTime = new Date();
        let shortMonth = dateTime.toLocaleString('en-us', { month: 'short' });
        let accessed = `[accessed ${dateTime.getDate() } ${shortMonth}. ${dateTime.getFullYear()}]`
        let author = 'Tur, Audie';
        let publication = "True Statistics Research Inc";
        let citation = `${text}\n-${author}. ${dateTime.getFullYear()}. ${publication}. ${accessed}; ${window.location.href}.`;
        navigator.clipboard.writeText(citation);
    }


    adjectives = await getServerCsv("/assets/words/Adjectives.csv");
    nouns = await getServerCsv("/assets/words/Nouns.csv");
    vocab = await (await fetch("/assets/vocab.json")).json();

    setActive(false);

    let mobileAndTabletCheck = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

    let loadingText = get("loading-text");

    mobile = mobileAndTabletCheck();
    if(!mobile){
        startWorker(getModelUrl(false));
        loadingSuggestion.style.removeProperty("display");
        loadingSuggestion.onclick = () => {
            worker.terminate();
            startWorker(getModelUrl(true));
            loadingText.innerHTML = "Loading (small model)";
        }
    }
    else{
        loadingText.innerHTML = "Loading (Mobile)";
        await load(getModelUrl(true), adjectives, nouns, vocab);
        button.onclick = generate;
        setActive(true);

        disableLoadingScreen();
    }

}

async function generate(){
    setActive(false);

    let getInputs = () => {
        let inputs = [undefined, undefined];
        let maskIndex = -1;
        for(let i = 0; i < inputs.length; i++){
            let text = generatedTexts[i+1];
            if(text.hasChanged()){
                inputs[i] = text.element.value;
                maskIndex = i === 0 ? 1 : 0;
                break;
            }
        }

        return {inputs, maskIndex};
    }

    let onWorkerMessage = (e) => {
        if(Array.isArray(e.data)){
            generatedTexts.forEach((child, index) => {
                if(index === 0){
                    child.innerHTML = e.data[index];
                    child.style.color = randomColour();
                }
                else {
                    child.setGenerated(e.data[index]);
                }
            });
            setActive(true);
            if(!mobile){
                worker.removeEventListener("message", onWorkerMessage);
            }
        }
    };
    if(!mobile){
        worker.addEventListener("message", onWorkerMessage);

        let inputs = getInputs();
        worker.postMessage(["generate", inputs.inputs, inputs.maskIndex, randomnessSlider.value]);

    }else{
        let inputs = getInputs();
        let results = await generateStat(inputs.inputs, inputs.maskIndex, randomnessSlider.value)
        onWorkerMessage({data: results});
    }

}

main();





