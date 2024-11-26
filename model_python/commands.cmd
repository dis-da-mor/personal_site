source ./.venv/bin/activate
.venv/bin/nuitka main.py --remove-output
cp main.bin ../model.bin
cp words ../ -r
