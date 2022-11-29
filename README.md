# CHRONOS
---

Calendar app

## About app
---
Just calendar, with events etc.

<h3>Technology stack:</h3>
<ul>
	<li><b>Backend</b>: 	<i>NodeJS</i>, <i>Express</i> </li>
	<li><b>Database</b>: 	<i>Postgresql</i> </li>
	<li><b>Frontend</b>: 	<i>React</i>, <i>Redux></i>, <i>SASS</i>, <i>MUI</i> </li>
	<li><b>Bundler</b>: 	<i>Vite</i> </li>
</ul>

<h3>Architecture:<h3>
<ul>
	<li><b>Server-API:</b> 	<i>REST and JSON-API specifications, MVC pattern</i> </li>
	<li><b>Database-API:</b> <i>builder pattern</i> </li>
	<li><b>Styles:</b> <i> BEM specification</i> </li>
	<li><b>Authentication:</b> <i> Access and refresh tokens model with JWT</i> </li>
</ul>

<h3>Features:<h3>
<ul>	
	<li>Authorization, registering, reseting password</li>
	<li>User pages</li>
	<li>All CRUD operations with calendars and events</li>
	<li>Push notifications</li>
	<li>Additional calendars</li>
	<li>Calendars and events sharing</li>
	<li>Region events and holidays</li>
	<li>Incredible loaders, slow down your network just to face this beauty</li>
</ul>
<hr>
<h2>Before start preparations</h2>

### 1. Database
---
    start postgresql server and create empty data base 	#docker container probably the most convinient way
    
### 2. Setup the environment
---
#### Create ***.env*** file with following entries:
	- PORT= #port
	- CLIENT_PORT= #port of client
	- HOST= #host
	- JWT_TOKEN= #token key
	- JWT_ACCESS_TOKEN_LIFESPAN= #minutes exp: '60 minutes'
	- JWT_REFRESH_TOKEN_LIFESPAN= #hours (not less than 1, not greater than 6) exp: '2 hours'
	- DB_URL= #postgres connection string exp: "postgresql://user:password@localhost:8889/db_name?sslmode=disable"
	- MAILGUN_API_KEY= #your api key for mailgun service
	- MAILGUN_DOMEN= #your mailgun domen
	- DISABLE_MAILGUN = # 1 in case you want to disable it or 0 if not

### 3. Installing dependencies and preparing database
---
	yarn packages      
	cd server && yarn migrate

### 4. Starting app
---
	#start in different terminals or in daemon mode
	yarn dev:client 	#for developing mode
	yarn dev:server 	#for developing mode
