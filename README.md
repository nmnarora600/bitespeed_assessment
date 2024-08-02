# Bitespeed's Assessment

This repository contains my assessment (Identity Reconciliation) submitted to Bitespeed for the role of Software Engineer (Backend).

## Steps to run app locally

## Clone the repo
* Open your terminal.

* Change the current working directory to the location where you want to clone the repository.

* Run the following command to clone the repository:
```bash
git clone https://github.com/nmnarora600/bitespeed_assessment.git
```


## Installing the Required Dependencies

After cloning the repo run run following commands to install required node modules.

* check in to bitespeed_assessment
```bash
cd bitespeed_assessment
```
* install node modules
```bash
npm install
```



## Run in Development Mode

After following above steps just open the frontend folder in cmd, powershell etc.
```bash
cd Path/to/the/repo/bitespeed_assessment
```
* Run the following command to start app in development mode

```bash
npx ts-node-dev src/index.ts
```

* Open your Browser and go to the following link to see your app 

```bash
http://localhost:3000
```
## Endpoints' Description
This api contains 2 endpoints
*  /identify   
```bash
http://localhost:3000/identify
```
this endpoint expects a post request with mandatory email and phoneNumber and adds new tuples to table and alters the linkPrecedence
##### Example Request body
```bash
{
  "email": "johndoe@example.com",
  "phoneNumber": "123456"
}
```

  *  '/' (default endpoint)  
```bash
http://localhost:3000/
```
this endpoint expects a get request and prints all tuples within the table

## Hosted API
You can check the hosted version of this api deployed from scratch on vps at
* For GET request
```bash
https://bitespeed.namanarora.in
```
* For POST request
```bash
https://bitespeed.namanarora.in/identify
```

## Screenshots of Assessment
### Fetching Data through '/'
![Thumb](https://github.com/nmnarora600/bitespeed_assessment/blob/main/screenshots/bitespeed-getdata.png)


### Adding and altering data through '/identify'
![Thumb](https://github.com/nmnarora600/bitespeed_assessment/blob/main/screenshots/bitespeed-postdata.png)
