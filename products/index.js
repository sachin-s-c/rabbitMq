const express = require('express');
const amqp = require('amqplib');
let channel;

async function connect() {
  const amqpServer = "amqp://localhost:5672"
  const connection = await amqp.connect(amqpServer);
  console.log("connected");
  channel = await connection.createChannel();
  await channel.assertQueue('PRODUCT');
}

connect().catch(error => {
  console.error('Unable to connect to the Rabbit MQ:', error);
  process.exit(1);
});

const app = express();

app.use(express.json());

const port =  4001;

app.listen(port, () => {
  console.log(`Products Service at ${port}`);
});


app.post('/products/buy', async  (req, res) => {
  const { name, price } = req.body;



  let order;

  channel.sendToQueue(
    'ORDER',
    Buffer.from(
      JSON.stringify({
        name,
        price
        
      })
    )
  );
  await channel.consume('PRODUCT', data => {
    console.log(data,"lllllllllllllllllll");
    order = JSON.parse(data.content);

  });
  res.json(order)
  //res.status(200).json(product);
});


