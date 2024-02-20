* check!
pm2 start route.js --max-memory-restart 2G

* Run
pm2 start route.js 
pm2 stop route.js
pm2 status

pm2 logs


en powershell para matar todos los procesos de node:
taskkill /f /im node.exe