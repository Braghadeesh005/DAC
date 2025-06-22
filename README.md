# DAC
Deployment Made Easy. One step tool to deploy your app in our premises.

DAC BASE SETUP :

DIRECTORY-STRUCTURE :

DAC/
├── backup/				                	# (Have the old client build backup)
├── bin/
│   ├── run.sh					        	# (Supports both cold and Warm Start)
│   └── build.sh				        	# (Build the client source code)
├── data/
│   └── dacdb.xml				        	# (Data to populate during cold Start)
├── logs/
│   ├── serverlog/				        	# (Directory for DAC Logs)
│   ├──	startup.log 			        	# (DAC Startup Logs)
│   └──	build.log 				        	# (Build Logs)
├── server/
│   ├── client/
│   │   └── dac/				        	# (Client Source Code)
│   │       ├── node_modules/			
│   │       ├── build/			        	# (Client Build)
│   │       ├── public/
│   │       ├── src/
│   │       ├── .gitignore
│   │       ├── eslint.config.js
│   │       ├── index.html
│   │       ├── package-lock.json
│   │       ├── package.json
│   │       ├── README.md
│   │       └── vite.config.js
│   │
│   ├── node_modules/
│   ├── router/					        	# (Routing page for each modules)
│   ├── src/					        	# (Source server code)
│   │   ├── dac/
│   │ 		├── authentication/				
│   │ 		├── conf/			        	
│   │ 		├── db/					        
│   │ 		├── middleware/					
│   │ 		├── schedules/					
│   │ 		├── security/					
│   │ 		├── startup/					 
│   │   	└── util/				        
│   ├── dac-index.js			        	
│   ├── package-lock.json
│   └── package.json
└── .gitignore

Work :

1. run.sh script :
	→ Will write all the logs in this script in startup.log
	→ Check whether any other process running in the same port or dac is already running
	→ Check npm is installed
	→ Prepare logs - Creates log directory everytime if it's not present
	→ Check for cold or warm start
	→ If cold start (Mysql root password should be given as a argument)
		→ Check in db for db existance. If not exists, create.
		→ Populates data from dacdb.xml file
		→ Then call server startup
	→ If warm start, then it calls server startup
		→ call npm start and dac-index.js will be invoked.
		
2. dac-index.js :
	→ Initialize DAC Logs by calling logs class. 
	→ DB Connection class - Should have a function which return connection object. 
	→ Create DB Class - Should have methods to perform all DB operations which calls DB Connection class to get connection object. 
	→ Initialize Startup class (This will contain the Schedules which starts during server startup) 
	→ Render client in '/' - Merge react frontend in this same port 
	→ Connect with router pages for each module. The api should start with /api 
	
3. APIs : AutheticationAPi, FirewallApi, InventoryApi, LBApi 

4. Client-side code - Basic Setup

5. build.sh script :
	→ Check if already a build exists, if exists take a copy of build and archive it with tar and move to /backup.
	→ Then run npm run build.
	→ Rename dist to build.
	