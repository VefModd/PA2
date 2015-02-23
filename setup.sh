#!/bin/bash
bower intsll -d
npm install -d
grunt concat
grunt uglify
