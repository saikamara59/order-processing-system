const request = require('supertest');
const express = require('express');

let app;
let channelMock;

beforeAll(() => {
  app = express();
  app.use(express.json());

  // Mock channel
  channelMock = { sendToQueue: jest.fn() };

  // Inject mock channel into route
  app.post('/order', (req, res) => {
    const order = { userId: req.body.userId, items: req.body.items };
    channelMock.sendToQueue('order_queue', Buffer.from(JSON.stringify(order)));
    res.send('Order placed');
  });
});

test('POST /order should send order to queue and respond', async () => {
  const response = await request(app)
    .post('/order')
    .send({ userId: 'test', items: ['apple'] });

  expect(response.text).toBe('Order placed');
  expect(channelMock.sendToQueue).toHaveBeenCalledWith(
    'order_queue',
    expect.any(Buffer)
  );
});