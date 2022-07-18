### Crypto Exchange Query App

---
### Get Start
create local config file and setup the config from config/local.js
```
cp config/default.js config/local.js
```
Init the app
```
npm run init
```
start the app
```
npm run dev
```
build the app
```
npm run build
```
start the built app
```
npm run start
```
---
### Migration
migrate data feed
```
npm run migrate:up
npm run db:seed:all
```
### Docker
run docker compose - start the project on 3000 port
```
docker-compose up -d
```
---
### API Endpoint

**Get latest exchange rate**
```
curl http://<HOST>/api/exchange_rate/:from/:to
```
Example - ETH/USD
```
http://localhost:3000/api/exchange_rate/ETH/USD
```

**Get exchange rate by given timestamp**
```
curl http://<HOST>/api/exchange_rate/:from/:to/:given_time
```
Example - ETH/USD - Saturday, July 16, 2022 11:45:40 AM UTC
```
http://localhost:3000/api/exchange_rate/ETH/USD/1657971940
```
---
#### Unit Test
Run the test
```
npm test
```
View the report from **test-report.html**
