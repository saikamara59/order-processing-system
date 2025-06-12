const express = require('express');
const amqp = require('amqplib');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { Sequelize, DataTypes } = require('sequelize'); 

const app = express();
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Service API',
      version: '1.0.0',
      description: 'API documentation for the Order Service',
    },
  },
  apis: ['./index.js'], 
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
      console.log('Waiting for RabbitMQ..', err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
connect();


const sequelize = new Sequelize('ordersdb', 'orderuser', 'orderpass', {
  host: 'postgres',
  dialect: 'postgres',
});

const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  timestamps: true,
});

sequelize.sync().then(() => console.log('Connected to PostgreSQL'));

/**
 * @openapi
 * /order:
 *   post:
 *     summary: Place a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - type: object
 *                       properties:
 *                         product:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *     responses:
 *       200:
 *         description: Order placed
 */

app.post('/order', async (req, res) => {
  const order = { userId: req.body.userId, items: req.body.items };
  await Order.create(order);
  channel.sendToQueue('order_queue', Buffer.from(JSON.stringify(order)));
  res.send('Order placed');
});

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: string
 *                   items:
 *                     type: array
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 */
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


app.listen(3000, () => console.log('Order Service listening on port 3000'));