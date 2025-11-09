# muesli

simple music player

## setup

clone this repo:

```bash
git clone https://codeberg.org/luminousherbs/muesli.git
```

add your music files to [`data/music`](data/music)

if you haven't already, install node:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 24
```

start the server:

```bash
node tools/serve.js
```
