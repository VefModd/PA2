#!/bin/bash
bower install -d
npm install -d
grunt concat
grunt uglify
