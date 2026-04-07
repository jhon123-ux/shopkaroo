import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopkaroo API',
      version: '1.0.0',
      description: 'Backend API for Shopkaroo.com — Pakistan furniture e-commerce. COD only.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
      { url: 'https://api.shopkaroo.com', description: 'Production' }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Sheesham Sofa Set 3 Seater' },
            name_urdu: { type: 'string', example: 'سیسم سوفہ سیٹ' },
            slug: { type: 'string', example: 'sheesham-sofa-set-3-seater' },
            description: { type: 'string' },
            price_pkr: { type: 'integer', example: 45000 },
            sale_price: { type: 'integer', example: 39000 },
            category: { type: 'string', example: 'living-room' },
            material: { type: 'string', example: 'sheesham' },
            dimensions: {
              type: 'object',
              properties: {
                L: { type: 'number' }, W: { type: 'number' },
                H: { type: 'number' }, unit: { type: 'string', example: 'cm' }
              }
            },
            images: { type: 'array', items: { type: 'string' } },
            stock_qty: { type: 'integer', example: 10 },
            weight_kg: { type: 'number', example: 45.5 },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            order_number: { type: 'string', example: 'SKR-2025-0001' },
            customer_name: { type: 'string', example: 'Ahmed Khan' },
            customer_email: { 
              type: 'string', 
              format: 'email',
              nullable: true,
              example: 'ahmed@gmail.com' 
            },
            phone: { type: 'string', example: '03001234567' },
            city: { type: 'string', example: 'Lahore' },
            address: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            subtotal_pkr: { type: 'integer' },
            delivery_fee: { type: 'integer', example: 0 },
            total_pkr: { type: 'integer', example: 45000 },
            payment: { type: 'string', example: 'COD' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
            },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            product_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            qty: { type: 'integer' },
            price_pkr: { type: 'integer' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Living Room' },
            slug: { type: 'string', example: 'living-room' },
            icon: { type: 'string' },
            image: { type: 'string' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            product_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Sara Ahmed' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            is_approved: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        Banner: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            subtitle: { type: 'string' },
            badge_text: { type: 'string' },
            badge_color: { type: 'string', example: '#783A3A' },
            cta_primary_text: { type: 'string' },
            cta_primary_link: { type: 'string' },
            cta_secondary_text: { type: 'string' },
            cta_secondary_link: { type: 'string' },
            bg_image_url: { type: 'string', nullable: true },
            bg_overlay: { type: 'string', example: 'rgba(26,26,46,0.55)' },
            sort_order: { type: 'integer' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        OfferBanner: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Up to 30% Off' },
            subtitle: { type: 'string' },
            badge_text: { type: 'string', example: 'LIMITED TIME OFFER' },
            cta_text: { type: 'string', example: 'Shop Now' },
            cta_link: { type: 'string', example: '/furniture/sale' },
            end_date: { type: 'string', format: 'date-time' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
}

export default function swaggerSetup(app: Express) {
  const spec = swaggerJsdoc(options)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))
  app.get('/api-docs/json', (req, res) => res.json(spec))
}
