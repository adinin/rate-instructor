## AirPair Editor Tips

As you type you'll see the preview pane update. The longer your posts gets, the less frequently it will refresh. To show the latest content immediately, click anywhere (*i.e. blur*) out of the editor.

Note that you still need to click **SAVE** to save your work. If the **SAVE** button is disabled, it means your Markdown is saved.

## Handy Markdown snippets

### Links and Images

Links are easy! Here's link back to [Your post contributions](/posts/me). Here's an absolute link to the [AirPair posts section with a title attribute](https://airpair.com/posts "AirPair Posts"). Images are similar to links, but with a ! infront:

![AirPair Logo](/static/img/css/airpair-author.png)

### Headings

## Use h2 for headings

- h1 is already taken by your post's title, so don't use single # h1 headings

### h3 are good for sub-headings

Together H1s and H2s will appear automatically in your Table of contents. You'll be able to see them later when you click **PREVIEW**.

## Code blocks

Code blocks are the same as github flavored fenced code blocks. You can

```
No language specified
```

```coffeescript
#Code blocks with language
```

```coffeescript,linenums=true
#Code blocks with language and linenums
() ->
  coolness = true
```

```javascript,linenums=true
//Code blocks for javascript
function() {
  var coolness = true
}
```

## Special characters

* Note to use reserved Markdown characters escape them with a backslash



This post is not a basic intro to Docker. If you are looking to do a really awesome tutorial on your local machine using Virtual Box
[Awesome GET STARTED with Docker and Node](https://airpair.com/node.js/posts/getting-started-with-docker-for-the-nodejs-dev "AirPair Posts")

## What to expect and why am I doing it 
Since I have been learning to fly a small Cesna 172, this is the first step in creating a live resource for folks to be able to find and rate their instructor. We are going to take an existing simple application and make it live on AWS. We are going to use Docker to deploy this app - and the stack is Angular, Mongo, Node single page app.

## Background - Raw Steps 
    
### Live Demo - check it out to get inspired before you begin 
    http://ec2-52-90-103-202.compute-1.amazonaws.com/
    
### Before we begin

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

### Local Host Test 
    $osxterm: git clone https://github.com/georgebatalinski/rate-instructor.git
    $osxterm: npm install
    $osxterm: npm start
    Your Web browser: http://localhost:8000
    
    


## Signing up for AWS and configuration 

Step 0) [Open this AWS guide - and keep it in one of your tabs :)](https://docs.docker.com/machine/drivers/aws/ "AirPair Posts") 
Step 1) [Create an AWS account FREE tier](https://aws.amazon.com/console/ "AirPair Posts") - once you have signed up - PROCEED to Step 2)
Step 2) access-id and secret-key and VPC id Note: To get the VPC id - Click on the VPC icon in the Amazon Console Dashboard 
ADDITIONAL NOTE: For a simple setup, just use the "Start VPC Wizard." - If you are not familiar what benefits you get from your VPC/ - [Amazon Virtual Private Cloud (VPC)](https://aws.amazon.com/vpc/) 


## Creating a VM (or docker machine) on AWS 

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
space 

```javascript,linenums=true
docker-machine -D create \
    --driver amazonec2 \
    --amazonec2-access-key <AWS_ACCESS_KEY_ID> \
    --amazonec2-secret-key <AWS_SECRET_ACCESS_KEY> \
    --amazonec2-vpc-id <AWS_VPC_ID> \
    --amazonec2-zone a \
    tennis-partner
```

Things of note here 

--driver amazonec2 - each provider has a driver that is used for to set defaults and interpret the flags provided [If you can read GO and are curious](https://github.com/docker/machine/blob/master/drivers/amazonec2/amazonec2.go "AirPair Posts")
 
--amazonec2-zone a 
Note: defaultRegion = "us-east-1" --- If you wanted to specify a diffrent region use --amazonec2-region

tennis-partner - it is just the name of the docker machine -- name it what you like e.g. {you-choose-name} etc. 



## Creating a Dockerfile to be associated with your porject 
This is a instruction file that you will write to, to automate the copying and installation of your files from the local repository. 

```javascript,linenums=true
   $osxterm: git clone https://github.com/georgebatalinski/rate-instructor.git
   $osxterm: git checkout clean-slate
```

Lets create our Dockerfile - using terminal or your favourite editor 

```javascript,linenums=true
   $osxterm: vi Dockerfile 
```

Copy the following information in to the file 
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

Things of note here 

FROM node  - any Dockerfile must start with an image (in our case we want to run a node server) 

EXPOSE 8000 - internal port for the CONTAINER - what server.js is listening to app.listen(8000);

CMD ["node", "/usr/src/app/server.js"] - run the server 


## Docker-compose file 
Since we are setting up an application that will require multi-container setup. Reason: We need to be able to run multiple processes in the containers and we also like to isolate our DB with a Data volume.
Docker-compose will help us create another instruction file - that will allow us to create containers from multiple images. 

Lets create our Dockerfile - using terminal or your favourite editor 

```javascript,linenums=true
   $osxterm: vi dockerfile-compose.yml 
```


Copy the following information in to the file 

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

Note: build context that is sent to the Docker daemon.???
Make sure you are not in your root directory when running docker compose 
Read about build context 
Essentially when docker build is happening - the directory with the Dockerifle is sent to the DEMON - who executes your build 
[Github issue](https://github.com/docker/docker/issues/2342 "AirPair Posts")

Data volumes 
Data volumes are designed to persist data, independent of the container’s life cycle. Docker therefore never automatically delete volumes when you remove a container, nor will it “garbage collect” volumes that are no longer referenced by a container. [Link to data](https://docs.docker.com/engine/userguide/dockervolumes/#adding-a-data-volume "AirPair Posts")

/opt/webapp - Docker volumes default to mount in read-write mode, but you can also set it to be mounted read-only. - e.g. /opt/webapp:ro

Why are volumes important?
MongoDB stores it's data in the data directory specified by --dbpath. It uses a database format so it's not actual documents, - so we need to save it somewhere and specify for backup if required 


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
Data fileds: { name : string, hoursflown: number, numberOfLikes: number } 


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



## Recommended Reading 
Read this article [Compose](https://docs.docker.com/compose/compose-file "AirPair Posts")

## Common Errors 
### SSH fails after creation 
```javascript,linenums=true
SSH cmd err, output: exit status 255: 
Error getting ssh command 'exit 0' : Something went wrong running an SSH command!
```
### Unable to Connect to MongoDB via Robomongo 
```javascript,linenums=true
docker inspect -f '{{.NetworkSettings}}' db
map[27017/tcp:[{0.0.0.0 27017}]]
you may have no explicity exposed the port to the machine 
docker run -p 27017:27017 --name db -v /data/db -d mongo
```
