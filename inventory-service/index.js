const amqp = require('amqplib');

let stock = {
  apple: 10,
  banana: 5,
  orange: 8,
};

async function connect() {
  while (true) {
    try {
      const connection = await amqp.connect('amqp://rabbitmq');
      const channel = await connection.createChannel();
      await channel.assertQueue('order_queue');
      console.log('Inventory Service connected to RabbitMQ');

      channel.consume('order_queue', msg => {
        const order = JSON.parse(msg.content.toString());
        console.log('Inventory received order:', order);

        let outOfStock = false;
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            if (typeof item === 'string') {
              // Simple string item
              if (!stock[item] || stock[item] <= 0) {
                outOfStock = true;
              }
            } else if (typeof item === 'object' && item.product && item.quantity) {
              // Object with product and quantity
              if (!stock[item.product] || stock[item.product] < item.quantity) {
                outOfStock = true;
              }
            }
          }
        }

        if (outOfStock) {
          console.log('Out of stock:', order);
        } else {
          // Deduct stock
          for (const item of order.items) {
            if (typeof item === 'string') {
              stock[item]--;
            } else if (typeof item === 'object' && item.product && item.quantity) {
              stock[item.product] -= item.quantity;
            }
          }
          console.log('Stock updated:', stock);
        }

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
