#!/bin/bash
if [[ -n $1 ]]; then
	python -m SimpleHTTPServer $1
fi

