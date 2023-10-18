const express = require('express');
const amqp = require('amqplib');

let channel;

async function createOrder(product,price) {
  let newOrder={
    totalPrice:price,
    product:product,
  }

  return newOrder;
}

async function connect() {
  const amqpServer = 'amqp://localhost:5672';
  const connection = await amqp.connect(amqpServer);
  console.log("connected amqp");
  channel = await connection.createChannel();
  await channel.assertQueue('ORDER');
}

connect()
  .then(() => {
    channel.consume('ORDER', data => {
      console.log('Consuming ORDER service',data.content);

      const binaryData = data.content
      const jsonString = binaryData.toString();
      const jsonData = JSON.parse(jsonString)
      console.log(jsonData,"dbfdshfbfbfn");
      const { name, price } = jsonData
      console.log(name);
      createOrder(name,price)
        .then(newOrder => {
          channel.ack(data);
          channel.sendToQueue(
            'PRODUCT',
            Buffer.from(JSON.stringify({ newOrder }))
          );
        })
        .catch(err => {
          console.log(err);
        });
    });
  })
  .catch(error => {
    console.error('Unable to connect to the Rabbit MQ:', error);
    process.exit(1);
  });

const app = express();

app.use(express.json());

const port = 4002;

app.listen(port, () => {
  console.log(`Orders Service at ${port}`);
});
