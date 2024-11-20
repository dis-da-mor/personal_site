const MAX_SEQ_LENGTH = 512
const MAX_INPUT_LENGTH = 30
const MASK = "***mask***";
let model = undefined;
let wordLists = [];
let optionsIds = [];

let sample = (array, limit=undefined) => {
    limit = limit === undefined? array.length : Math.min(array.length, limit);
    return array[Math.floor(Math.random()*limit)];
}

let cleanInput = (userInput) => {
    userInput = userInput.replace(/[^0-9a-z]/gi, '');
    if(userInput.length < 1) return undefined;
    if(userInput.length > MAX_INPUT_LENGTH) return userInput.substring(0, MAX_INPUT_LENGTH);
    return userInput;
}

async function generateStat(words, maskIndex, topK){

    if(maskIndex < 0){
        maskIndex = Math.floor(Math.random() * words.length);
    }
    words = words.map((value, index) => {
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
    let predictions = await model.execute(tokenized.inputs);
    let rankedOptions = tokenizer.processOutput(predictions, tokenized.maskIndex, wordLists[maskIndex], optionsIds[maskIndex]);
    predictions.dispose();
    let limit = Math.min(topK, rankedOptions.length);
    words[maskIndex] = sample(rankedOptions, limit);
    words = words.map((word) => {
        return word.replace(/(\r\n|\n|\r)/gm, "");
    });
    let results = [percentage, words[0], words[1]];

    self.postMessage(results);
}

async function load(url, adjectivesJson, nounsJson, vocab){

    importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");
    importScripts("./tokenizer.mjs");

    model = await tf.loadGraphModel(url);
    let dummyInput = new tf.zeros([1,512], "int32")
    await model.execute({
       "input_ids": dummyInput,
       "attention_mask": dummyInput
    });
    dummyInput.dispose();
    tokenizer = new BertTokenizer(true, MAX_SEQ_LENGTH);
    await tokenizer.load(vocab);
    wordLists.push(nounsJson);
    wordLists.push(adjectivesJson);
    optionsIds = Array.from(wordLists, wordList => {
       return Array.from(wordList, word => tokenizer.tokenize(word));
    });
    self.postMessage("loaded");
}

self.addEventListener('message', function(e) {
    if(e.data[0] === "load"){
        load(e.data[1], e.data[2], e.data[3], e.data[4]);
    }
    else if(e.data[0] === "generate"){
        generateStat(e.data[1], e.data[2], e.data[3]);
    }
}, false);



