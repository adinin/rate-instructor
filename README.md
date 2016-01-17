# rate-instructor
Docker Compose with API for rating flying instructors. This is an example of running a simple Angular, Mongo, Node single page app and using it on Docker.  
Since I have been learning to fly a small Cesna 172, this is the first step in creating a live resource for folks to be able to find and rate their instructor. Full app coming soon :)

# Background - Raw Steps 
    
## Live Demo - check it out to get inspired before you begin 
    http://ec2-52-90-103-202.compute-1.amazonaws.com/
    
## Before we begin

I'll be referring to commands executed in your own terminal with:

```javascript,linenums=true
    $osxterm: command
```

And commands inside a container with:
```javascript,linenums=true
    $ root: command
```

Output you get after running a command (in container/or your terminal)
```javascript,linenums=true
    %: output 
```

Output you get after running a command inside Mongo Shell 
```javascript,linenums=true
    > output 
```

## Local Host Test 
    $osxterm: git clone https://github.com/georgebatalinski/rate-instructor.git
    $osxterm: npm install
    $osxterm: npm start
    Your Web browser: http://localhost:8000
    

# Setup 
## Creating a VM on AWS 

```javascript,linenums=true
$osxterm: docker-machine -D create \
    --driver amazonec2 \
    --amazonec2-access-key <AWS_ACCESS_KEY_ID> \
    --amazonec2-secret-key <AWS_SECRET_ACCESS_KEY> \
    --amazonec2-vpc-id <AWS_VPC_ID> \
    --amazonec2-zone a \
    tennis-partner
```

```javascript,linenums=true
    $osxterm: docker-machine env tennis-partner
    $osxterm: eval "$(docker-machine env tennis-partner)"
```

Test if you got an instance 
```javascript,linenums=true
    $osxterm: docker-machine active 
    %: tennis-partner

    $osxterm: docker run busybox echo hello world
    %: hello world
```


## Creating a Dockerfile to be associated with your project

```javascript,linenums=true
FROM node 

RUN mkdir -p /usr/src/app

## run npm install
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app
RUN npm install

## copy the app
ADD . /usr/src/app

## expose the port - internal port for the CONTAINER - what server.js is listening to app.listen(8000);
EXPOSE 8000

## run the API
CMD ["/usr/local/bin/node", "/usr/src/app/server.js"]
```


## Docker-compose file 
```javascript,linenums=true
app:
  build: .
  ports:
    - "80:8000"
  links:
    - db
  working_dir: /usr/src/app
    
db:
  image: mongo
  ports:
    - "27017:27017"
  volumes_from:
    - dbdata

dbdata:
  image: busybox
  volumes:
    - /usr/lib/mongodb
```


## Building on AWS 
All the work - now we get the payoff

```javascript,linenums=true
    $osxterm: docker-compose up -d 
```
Check Public DNS (from AWS) - in my case it is: 
ec2-52-90-103-202.compute-1.amazonaws.com
    
## Add data to our DB
### Get into our OS on Docker
```javascript,linenums=true
    $osxterm: docker exec -it <CONTAINERID for your running NODE container> /bin/bash
```
### Install Mongo shell to connect to our DB
```javascript,linenums=true
    $ root: apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
    $ root: echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list 
    $ root: apt-get update
    $ root: apt-get install -y mongodb-org-shell   
```
### Check the IP address of the mongod process 
```javascript,linenums=true
    $ root: cat /etc/hosts
    
    %: 172.17.0.2	db 3fac66047f37 rateinstructor_db_1
       172.17.0.2	db_1 3fac66047f37 rateinstructor_db_1
       172.17.0.2	rateinstructor_db_1 3fac66047f37
```

### Connect to mongod using the shell  
```javascript,linenums=true
    $ root: mongo 172.17.0.2:27017
```

### Now you are inside mongod - add your data 
We need the following data:
Db name: school 
Collection Name: instructors
Data fileds: { name : 'Frank ' + i, hoursflown: i * 100, numberOfLikes: 0 } 


```javascript,linenums=true
> show dbs
    local  0.000GB
> use school
    switched to db school
> db.createCollection('instructors')
    { "ok" : 1 }
> for (var i = 1; i <= 25; i++) {
...    db.instructors.insert( { name : 'Frank ' + i, hoursflown: i * 100, numberOfLikes: 0 } )
... }

```

## Back up your data
```javascript,linenums=true
    $osxterm: docker exec -it 3fac66047f37 /bin/bash
    $ root: tar -cvpzf /dbbackup.tar.gz /data/db 
    $ root: exit 
    $osxterm: docker cp 3fac66047f37:/dbbackup.tar.gz /Users/jerzybatalinski/Desktop/ 
```





