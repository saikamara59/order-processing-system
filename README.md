# Order Processing System
a simple microservices-based order processing system using Node.js, Express Includes Swagger API docs and Docker Compose for easy setup.

## Features

- **Order Service**: Place and view orders via REST API.
- **Inventory Service**: Updates stock based on orders (via RabbitMQ).
- **Billing Service**: Handles billing logic (via RabbitMQ).
- **RabbitMQ**: Message broker for service communication.
- **PostgreSQL**: Stores all orders.
- **Swagger UI**: API documentations at `/api-docs`.

## Getting Started

### Prerequesites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd order-processing-system
   ```

2. **Start all services:**
   ```sh
   docker-compose up --build -d
   ```

3. **Check services:**
   ```sh
   docker-compose ps
   ```


## API Usage

### Swagger Docs

Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for interactive API documentation.

### Place an Order

`POST /order`

**Request Body:** (Example)
```json
{
  "userId": "123",
  "items": ["apple", "banana"]
}
```

### Get All Orders


`GET /orders`

Returns a list of all the orders in the database.

## Project Structure

```
order-processing-system/
├── order-service/
├── inventory-service/
├── billing-service/
├── docker-compose.yml
└── README.md
```

## Development

- Edit code in the respective service folders.
- After changes, rebuild with:
  ```sh
  docker-compose up --build -d
  ```

---

