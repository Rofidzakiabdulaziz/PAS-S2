const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const authRoute = require('./routes/authRoute');
const TodoRoute = require('./routes/todoRoute');




const app = express();
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))

 app.use('/api/auth',authRoute);
 app.use("/api", TodoRoute);


const PORT = 3000 || process.env.PORT;  

app.listen(PORT, () => {
    // menjalankan PORT
    console.log(`Server is running on port ${PORT}`)
})



