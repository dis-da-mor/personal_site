from fitbert import FitBert
from random import random, choices
import transformers

def list_from_file(path):
    with open(path, "r") as file:
        return file.readlines()

adjectives = list_from_file("words/adjectives.txt")
nouns = list_from_file("words/nouns.txt")

def stat_masked(word):
    number = round(random() * 100, 1)
    return f"{number}% of {word} are ***mask***.", number, word

tiny = transformers.BertForMaskedLM.from_pretrained("prajjwal1/bert-tiny")
fb = FitBert(model=tiny)
def do_stat(text_input):
   input_len = len(text_input)
   randomness = float(text_input[0])
   if randomness <= 0 or randomness >= 1:
       raise  Exception("randomness must be between 0 and 1 exclusive")
   if input_len == 1:
       word_input = choices(nouns)[0].strip()
   elif input_len == 2:
       word_input = text_input[1].strip().replace("***mask***", "mask")
   else:
       raise Exception("2 inputs need to be given, separated by a space")
   sentence, number, word = stat_masked(word_input)
   ranked = fb.rank(sentence, options=adjectives)
   consider = int(len(ranked) * (1-randomness))
   if consider < 1:
       consider = 1
   elif consider >= len(ranked):
       consider = len(ranked) - 1
   chosen = choices(ranked[:consider])[0].strip()
   return f"{number} {word} {chosen}".encode()
