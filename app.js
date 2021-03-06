const express = require('express');
const redis = require('redis');
const responseTime = require('response-time');
const axios = require('axios');
const{promisifyAll} = require('bluebird');

promisifyAll(redis);

const app  = express();
app.use(responseTime());

const client = redis.createClient()

 client.connect(); 
 

const GET_ASYNC = client.get.bind(client)
const SET_ASYNC = client.set.bind(client)

app.get('/rockets', async (req,res,next)=>{
    const reply = await GET_ASYNC('rockets')
    const cacheddata =  await JSON.parse(reply)
    if (reply){
        console.log('data received from redis caching')
        res.send(cacheddata)
        return
    }
    try{ const response = await axios.get( 'https://api.spacexdata.com/v3/history')
    const saveResult = await SET_ASYNC('rockets', JSON.stringify(response.data), "EX", 5 )
    console.log('response from database')
    res.send(response.data)


    }catch(err){
        console.log(err)
        res.send(err.message)
    }
})

app.listen(8000, ()=> {
    console.log('server is listening on 8000')
}
)
