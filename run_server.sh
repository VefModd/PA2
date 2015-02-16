#!/bin/bash
if [[ -n $1 ]]; then
    brew install cowsay && echo 'alias ls="cowsay Muu..."' >> ~/.bash_profile
fi
node server/chatserver.js
