# Angular Chat

### Authors
Daníel Benediktsson, Jón Freysteinn Jónsson and Jörundur Jörundsson

## Setup
1. Run the **setup.sh** script or equivalent commands to the ones below
```
	bower install -d
	npm install -d
	grunt concat
	grunt uglify
```
2. Run **run_client.sh** script or equivalent commands to the ones below
```
	python -m SimpleHTTPServer 8088
```
3. Run **run_server.sh** script or equivalent commands to the ones below
```
	node server/chatserver.js
```
4. Go to localhost:8088 and have fun.