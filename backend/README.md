# Auto Parts Management System - Backend API

A comprehensive NestJS REST API for managing auto parts inventory, customers, orders, and suppliers with PostgreSQL database.

## 🚀 Features

- **14 Database Entities** with complete relationships
- **26+ REST API Endpoints** with full CRUD operations
- **Swagger/OpenAPI Documentation** for interactive API testing
- **TypeORM** for database management with automatic migrations
- **Global Validation** using class-validator
- **CORS Support** for frontend integration
- **Transaction Support** for complex operations

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**

Create a `.env` file in the backend root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=autoparts_db

# JWT Configuration (for future authentication)
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

3. **Create PostgreSQL database:**
```bash
psql postgres -c "CREATE DATABASE autoparts_db;"
```

4. **Start the development server:**
```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

Interactive Swagger documentation is available at:
```
http://localhost:3000/api/docs
```

## 🗄️ Database Schema

### Core Entities (14 Tables)

1. **users** - User accounts with role-based access (admin, manager, sales, warehouse)
2. **customers** - Customer management (retail, wholesale, dealer types)
3. **vehicles** - Customer vehicle tracking
4. **categories** - Hierarchical part categories
5. **suppliers** - Supplier management with ratings
6. **parts** - Main inventory table with pricing and stock tracking
7. **part_compatibility** - Vehicle fitment data
8. **orders** - Customer orders and quotes
9. **order_items** - Order line items
10. **payments** - Payment tracking
11. **purchase_orders** - Supplier orders
12. **purchase_order_items** - Purchase order line items
13. **inventory_movements** - Stock movement audit trail
14. **returns** - Customer returns and warranty claims

### Entity Relationships

```
Customer ──< Vehicle
Customer ──< Order ──< OrderItem >── Part
Customer ──< Return
Supplier ──< Part
Supplier ──< PurchaseOrder ──< PurchaseOrderItem >── Part
Category ──< Part
Category ──< Category (self-referencing for hierarchy)
Part ──< PartCompatibility
Part ──< InventoryMovement
Order ──< Payment
User ──< Order (created_by)
User ──< InventoryMovement (created_by)
```

## 🔌 API Endpoints

### Parts Management
- `POST /parts` - Create a new part
- `GET /parts` - Get all parts
- `GET /parts/low-stock` - Get parts below minimum stock level
- `GET /parts/:id` - Get part by ID
- `PATCH /parts/:id` - Update a part
- `DELETE /parts/:id` - Delete a part

### Customer Management
- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID (includes vehicles and orders)
- `PATCH /customers/:id` - Update a customer
- `DELETE /customers/:id` - Delete a customer

### Order Management
- `POST /orders` - Create a new order (with order items)
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID (includes items and customer)
- `PATCH /orders/:id` - Update an order
- `DELETE /orders/:id` - Delete an order

### Supplier Management
- `POST /suppliers` - Create a new supplier
- `GET /suppliers` - Get all suppliers
- `GET /suppliers/:id` - Get supplier by ID (includes parts)
- `PATCH /suppliers/:id` - Update a supplier
- `DELETE /suppliers/:id` - Delete a supplier

### Category Management
- `POST /categories` - Create a new category
- `GET /categories` - Get all top-level categories (with children)
- `GET /categories/:id` - Get category by ID (includes parent, children, and parts)
- `PATCH /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

## 📝 Example API Usage

### Create a Part

```bash
curl -X POST http://localhost:3000/parts \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "BP-TOY-CAM-2020-F",
    "name": "Brake Pads Front Set",
    "description": "Premium ceramic brake pads",
    "categoryId": 1,
    "manufacturer": "Bosch",
    "brand": "Bosch",
    "oemNumber": "04465-06090",
    "condition": "new",
    "supplierId": 1,
    "costPrice": 45,
    "retailPrice": 89.99,
    "wholesalePrice": 65,
    "quantityInStock": 25,
    "minimumStockLevel": 15,
    "reorderPoint": 10
  }'
```

### Create an Order with Items

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "createdById": 1,
    "orderType": "retail",
    "status": "pending",
    "deliveryMethod": "pickup",
    "items": [
      {
        "partId": 1,
        "quantity": 2,
        "unitPrice": 89.99
      }
    ]
  }'
```

### Get Low Stock Parts

```bash
curl http://localhost:3000/parts/low-stock
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── entities/              # TypeORM entities
│   │   ├── user.entity.ts
│   │   ├── customer.entity.ts
│   │   ├── part.entity.ts
│   │   └── ...
│   ├── modules/               # Feature modules
│   │   ├── parts/
│   │   │   ├── parts.dto.ts
│   │   │   ├── parts.service.ts
│   │   │   ├── parts.controller.ts
│   │   │   └── parts.module.ts
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── suppliers/
│   │   └── categories/
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## 🔐 Data Validation

All DTOs include validation using `class-validator`:

```typescript
// Example: CreatePartDto
export class CreatePartDto {
  @IsString()
  @ApiProperty({ example: 'BP-001' })
  sku: string;

  @IsString()
  @ApiProperty({ example: 'Brake Pads' })
  name: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 45.00 })
  costPrice: number;

  @IsNumber()
  @ApiProperty()
  categoryId: number;

  // ... more fields
}
```

## 🔄 Database Synchronization

TypeORM is configured with `synchronize: true` in development mode, which automatically creates/updates database tables based on entities.

**⚠️ Important:** Set `synchronize: false` in production and use migrations instead.

## 🧪 Testing the API

1. **Using Swagger UI:**
   - Navigate to `http://localhost:3000/api/docs`
   - Click on any endpoint
   - Click "Try it out"
   - Fill in the request body
   - Click "Execute"

2. **Using curl:**
   - See examples above

3. **Using Postman:**
   - Import the OpenAPI spec from `http://localhost:3000/api/docs-json`

## 📊 Key Features

### Transaction Support
Orders are created with transaction support to ensure data integrity:
```typescript
await this.dataSource.transaction(async (manager) => {
  const order = await manager.save(Order, orderData);
  const items = await manager.save(OrderItem, orderItems);
  return order;
});
```

### Relationships
All entities properly handle relationships:
```typescript
@ManyToOne(() => Category, category => category.parts)
@JoinColumn({ name: 'category_id' })
category: Category;
```

### Indexes
Performance-critical fields have indexes:
```typescript
@Index()
@Column({ unique: true })
sku: string;
```

## 🚦 Available Scripts

```bash
# Development
npm run start:dev       # Start with hot-reload

# Production
npm run build          # Build for production
npm run start:prod     # Start production server

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
```

## 🔧 Configuration

### CORS
CORS is enabled for frontend integration:
```typescript
app.enableCors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true,
});
```

### Global Validation
All requests are validated automatically:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

## 📈 Future Enhancements

- [ ] JWT Authentication & Authorization
- [ ] Role-based access control (RBAC)
- [ ] File upload for part images
- [ ] Advanced search and filtering
- [ ] Reporting endpoints
- [ ] WebSocket for real-time updates
- [ ] Rate limiting
- [ ] API versioning

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql --version

# Test connection
psql -h localhost -U your_username -d autoparts_db
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### TypeORM Synchronization Issues
```bash
# Drop and recreate database
psql postgres -c "DROP DATABASE autoparts_db;"
psql postgres -c "CREATE DATABASE autoparts_db;"
```

## 📄 License

MIT

## 👥 Contributors

- Your Name

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with:** NestJS, TypeORM, PostgreSQL, Swagger
