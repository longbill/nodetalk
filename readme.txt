This service program is written by Longbill ( longbill.cn@gmail.com ) at 2011-07-18


installation:
npm install express ( maybe you need install npm first https://github.com/isaacs/npm)
npm install socket.io


mother process file is start.js

run "node start.js", then mother process will run "node server.js"
mother proccess will restart server.js 5 seconds after server.js exit

run "nohup node start.js > /dev/null &" if you want nodejs running at background even you close the terminal window





*webroot*

./webroot is the root directory of www files.
icon.jpg is the desktop icon for iOS devices
start.jpg is the default startup image for iOS devices