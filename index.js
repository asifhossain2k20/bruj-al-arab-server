const express = require('express')
const bodyParser = require('body-parser')
const cors= require('cors')
const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');
require('dotenv').config()

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skhdz.mongodb.net/brujAlArab?retryWrites=true&w=majority`;

const port = 5000


const serviceAccount = require("./configs/burj-al-arab-a5cf9-firebase-adminsdk-7os6w-f562cb8188.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const app = express()

app.use(cors());
app.use(bodyParser.json());



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("brujAlArab").collection("booking");
  // perform actions on the collection object
  console.log("DataBase Connected 100%");
 

    app.post('/addBooking',(req, res) => {
    
        const newBooking=req.body;
     bookings.insertOne(newBooking)
        .then(result=>{
            res.send(result.insertCount>1);
        })
        console.log(newBooking);
    
    });


    app.get('/bookings', (req, res)=>{
        // console.log(req.headers.authorization);

        const bearer=req.headers.authorization;
        if( bearer && bearer.startsWith('bearer ')){
            const idToken=bearer.split(' ')[1];
                admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                const tokenEmail = decodedToken.email;
                const queryEmail=req.query.email;
                        if(tokenEmail == queryEmail){
                            
                            bookings.find({email:queryEmail})
                            .toArray((err,document)=>{   
                                res.send(document)
                            })
                        }
                        else{
                            res.status(401).send('Un-Authorized User')
                        }
                })
                .catch((error) => {
                    res.status(401).send('Un-Authorized User')
                });
        }
        else{
            res.status(401).send('Un-Authorized User')
        }

    })


  })



    app.get('/', (req, res) => {
    res.send('Hello World!')
    })

app.listen(port)