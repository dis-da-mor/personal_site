from fitbert import FitBert
from random import random, choices
import transformers
import socket
import os
import sys

socket_path = "/tmp/sock"
try:
    os.unlink(socket_path)
except OSError:
    pass

sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
sock.bind(socket_path)
sock.listen()

def list_from_file(path):
    with open(path, "r") as file:
        return file.readlines()

adjectives = list_from_file("words/adjectives.txt")
nouns = list_from_file("words/nouns.txt")

tiny = transformers.BertForMaskedLM.from_pretrained("prajjwal1/bert-tiny")
fb = FitBert(model=tiny)

def stat_masked(word):
    number = round(random() * 100, 1)
    return f"{number}% of {word} are ***mask***.", number, word

while True:
    conn, _ = sock.accept()
    data = conn.recv(65534).decode()

    text_input = data.split()
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
    sentence, number_out, word_out = stat_masked(word_input)
    ranked = fb.rank(sentence, options=adjectives)
    consider = int(len(ranked) * (1-randomness))
    if consider < 1:
        consider = 1
    elif consider >= len(ranked):
        consider = len(ranked) - 1
    chosen = choices(ranked[:consider])[0].strip()
    conn.send(f"{number_out} {word_out} {chosen}".encode())
    conn.close()
