const amqp = require('amqplib');

async function connect() {
  while (true) {
    try {
      const connection = await amqp.connect('amqp://rabbitmq');
      const channel = await connection.createChannel();
      await channel.assertQueue('order_queue');
      console.log('Billing Service connected to RabbitMQ');

      channel.consume('order_queue', msg => {
        const order = JSON.parse(msg.content.toString());
        console.log('Billing received order:', order);

        // Simulate billing logic
        console.log(`Billing processed for user ${order.userId}, items:`, order.items);

        channel.ack(msg);
      });

      break;
    } catch (err) {
      console.error('Waiting for RabbitMQ...', err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

connect();
