const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let channel;

async function connect() {
  while (true) {
    try {
      const connection = await amqp.connect('amqp://rabbitmq');
      channel = await connection.createChannel();
      await channel.assertQueue('order_queue');
      console.log('Connected to RabbitMQ');
      break;
    } catch (err) {
      console.error('Waiting for RabbitMQ...', err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
connect();

app.post('/order', async (req, res) => {
  const order = { userId: req.body.userId, items: req.body.items };
  channel.sendToQueue('order_queue', Buffer.from(JSON.stringify(order)));
  res.send('Order placed');
});

app.listen(3000, () => console.log('Order Service listening on port 3000'));