# Arriyadh Studio Web

Arriyadh Studio Web is a full-stack web application for a garment production,
screen-printing, clothing alteration, and ready-stock product business. The
application provides permanent business information, structured ordering,
order-status tracking, manual payments, and an admin panel for managing orders
and website content.

This project was developed as a final vocational internship (PKL) project to
help digitize Arriyadh Studio's business processes.

## About the Project

The system has two primary actors:

- **Customers**, who can view information, place orders, make payments, and
  track orders without creating an account.
- **Admin**, who signs in through Supabase Auth to manage orders, workflows,
  payments, and website content.

Two order types are handled separately: custom services that require an admin
price review and ready-stock products with catalog pricing.

## Key Features

### Customers

- Homepage and business information.
- About Us page with an interactive Google Maps embed.
- Active service catalog and custom-service order form.
- Service-specific support for variants, sizes, materials, and design
  references.
- Ready-stock product catalog with variants, sizes, quantities, and checkout.
- Order confirmation and token-based payment pages.
- Payments through BRI bank transfer or COD.
- Transfer-proof upload with file validation.
- Order tracking by order code without a customer account.
- WhatsApp integration through `wa.me` links with prepared messages.
- Terms & Conditions and Privacy Policy pages.

Primary public routes:

| Route | Purpose |
| --- | --- |
| `/` | Homepage and business overview |
| `/tentang-kami` | Profile, workshop information, portfolio, and map |
| `/layanan` | Service catalog |
| `/layanan/[slug]/pesan` | Custom-service order form |
| `/produk` | Ready-stock product catalog |
| `/produk/[slug]/checkout` | Product checkout |
| `/pesanan/berhasil/[token]` | Order confirmation |
| `/pembayaran/[token]` | Payment selection/submission |
| `/lacak-pesanan` | Tracking by order code |
| `/syarat-ketentuan` | Terms and conditions |
| `/kebijakan-privasi` | Privacy policy |

### Admin

- Supabase Auth login with a single-admin model.
- Order summary dashboard.
- Order list with search, filters, and pagination.
- Order details and filtered CSV export.
- Custom-service price quotation.
- BRI transfer-proof verification.
- COD down payment confirmation for custom services.
- COD confirmation for ready-stock products.
- Status updates based on each order's workflow.
- Order cancellation and WhatsApp handoff to customers.
- CMS for business information, homepage, About Us, services, products,
  portfolio, featured services, and featured products.
- Active/published status, content ordering, and catalog image management.

Public admin signup is not available. Admin authorization uses
`app_metadata.role = "admin"`.

## Order Flows

### Custom Service Order

1. The customer selects an active service and enters the order requirements.
2. The server validates the data, variants, sizes, and required design
   references.
3. The database creates the order with the `menunggu_harga` status and a
   service snapshot.
4. The admin reviews the requirements and sets the price.
5. The database generates a down payment (DP) equal to 50% of the quoted price.
6. The customer selects BRI bank transfer or COD for the down payment.
7. The admin verifies the transfer or confirms the COD down payment.
8. The order enters the production workflow for its service type.
9. The admin updates the status, and the customer tracks it using the order
   code.

### Ready-Stock Product Purchase

1. The customer selects a product, active variant, size, and quantity.
2. The server recalculates the price from the active catalog and size
   surcharge.
3. The customer selects BRI bank transfer or COD.
4. The admin verifies the payment or confirms the COD order.
5. The order is processed through completion without entering the garment
   production workflow.

The product name, variant, quantity, and price are stored as snapshots when the
order is created, so order history does not depend entirely on later catalog
changes.

## Order Workflows

### Garment Production and Screen Printing

```text
Sample / Mockup
→ Design
→ Color Separation
→ Cutting
→ Screen Printing
→ Sewing
→ Ironing
→ Packing
→ Completed
```

### Alterations

```text
Received → In Progress → Quality Check → Completed
```

### Ready-Stock Products

```text
Awaiting Verification → Processing → Completed
```

The database and application restrict status transitions to the appropriate
workflow. The admin can also cancel orders that have not been completed.

## Payments and WhatsApp

Supported payment methods:

- BRI bank transfer.
- COD.

Production account details are configured in the application and displayed
only during the customer payment flow. The system does not use a payment
gateway or automatic payment verification; every payment is verified manually
by the admin.

WhatsApp integration uses official `wa.me` links. The application only prepares
and opens messages; customers or the admin must send them manually. The project
does not use bots or unofficial WhatsApp automation libraries.

## Order Tracking

Customers track orders using `order_code`, not a database UUID or payment
token. Public tracking results are limited to the information required to
understand the order type, item summary, status, and progress.

Customer names, WhatsApp numbers, email addresses, addresses, admin notes,
payment proofs, and private file paths are not included in public tracking
results.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Next.js 16.3.1 | Full-stack framework and App Router |
| React 19.2.8 | User-interface components |
| TypeScript | Application type safety |
| Tailwind CSS 4 | Utility styling and CSS-first design tokens |
| Supabase PostgreSQL | Primary database |
| Supabase Auth | Admin authentication |
| Supabase Storage | Image and order-document storage |
| `@supabase/ssr` | Server-side Supabase sessions and Proxy integration |
| `@supabase/supabase-js` | Supabase access from the application |
| npm | Package manager |
| Vercel | Next.js deployment target |

## Architecture Overview

The project uses the Next.js App Router with the following patterns:

- Server Components are the default for page composition and data fetching.
- Client Components are used for forms, menus, dialogs, uploads, filters, and
  browser interactions.
- Server Actions handle validation and mutations from public and admin forms.
- A single Route Handler handles admin order exports as CSV.
- Session-based operations use a session-bound Supabase server client that
  reads the user session from cookies.
- The elevated Supabase client is marked `server-only` and used only on trusted
  server paths that specifically need to bypass RLS.
- The root `proxy.ts` refreshes sessions and protects admin navigation.

## Project Structure

```text
app/          App Router routes, layouts, Server Actions, and Route Handler
components/   Reusable UI, public/admin layout, and page-section components
lib/          Data access, business logic, validation, auth, and Supabase clients
database/     Incremental SQL for schema, policy, and CMS changes
public/       Branding, icons, and local images
```

Public routes are grouped under `app/(public)`, while authenticated admin pages
are located in `app/admin/(protected)`.

## Database and Storage

Supabase PostgreSQL stores two order types: `service` and `product`. The
database manages unique order codes/tokens, catalog snapshots, product-price
validation, a generated 50% down payment, status-transition guards, and
historical snapshot protection.

The SQL files in `database/` are incremental patches, not a complete migration
history or base schema. Apply the required files in numerical order to a
Supabase project that already has the base schema. The latest patch is:

```text
database/step-5-13-admin-product-variants-select-policy.sql
```

This patch adds a SELECT path that allows the admin to read all product
variants, including inactive variants, without broadening public access.

Storage buckets:

| Bucket | Access | Limits and formats | Purpose |
| --- | --- | --- | --- |
| `content-images` | Public | 5 MiB; JPEG, PNG, WebP | CMS images |
| `design-references` | Private | 10 MiB; JPEG, PNG, WebP, PDF | Customer design references |
| `payment-proofs` | Private | 5 MiB; JPEG, PNG, WebP | Payment proofs |

File uploads are validated by size, MIME type, and signature/magic bytes. The
admin accesses documents in private buckets through short-lived signed URLs.

## Installation

Prerequisites:

- A Node.js version compatible with Next.js 16.
- npm.
- A configured Supabase project.

Clone the repository and install its dependencies:

```bash
git clone https://github.com/galangam/arriyadh-studio-web.git
cd arriyadh-studio-web
npm install
```

## Environment Variables

Create `.env.local` in the project root. The following three variables are
required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

The following variable can be added to configure the application origin
explicitly:

```env
NEXT_PUBLIC_SITE_URL=
```

`SUPABASE_SECRET_KEY` must only be available in the server environment. Do not
add a `NEXT_PUBLIC_` prefix, commit it to the repository, or access it from a
Client Component.

## Running the Project

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the production build locally:

```bash
npm run build
npm run start
```

## Validation

Run the following checks before deployment or change review:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three commands passed on the final branch when this README was prepared.

## Deployment

The deployment target is Vercel with Supabase as the backend:

1. Create or select a Supabase project and prepare the required base schema.
2. Apply the incremental SQL patches from `database/` in dependency and
   numerical order.
3. Configure the environment variables in the deployment environment.
4. Deploy the Next.js application to Vercel.
5. Verify public routes, admin login, ordering, payment, and tracking in the
   deployment environment.

Do not add Supabase secrets or private configuration to the repository or
public documentation.

## Security

- Admin routes are protected on the server and through the Proxy.
- Sensitive Server Actions perform their own admin authorization checks.
- The admin role comes from trusted Supabase Auth `app_metadata`.
- The elevated Supabase key is used only in server-only modules.
- Public browsers cannot directly SELECT from the orders table.
- Design references and payment proofs are stored in private buckets.
- Public tracking returns only a non-sensitive subset of order data.
- The database enforces status transitions, pricing integrity, and historical
  snapshots.

## System Limitations

- Customers do not have accounts and use order codes for tracking.
- Custom-service prices must be set by the admin before payment.
- Payments are verified manually.
- WhatsApp requires manual customer or admin interaction.
- The system does not provide automated payment settlement or financial
  reporting.

## Project Status

Core feature implementation and project validation are complete. The project is
currently in the final deployment stage and may continue to evolve through
fixes, refinements, and additional features in future versions.

## Development

This project was created as a final vocational internship (PKL) project and a
full-stack web development portfolio project to digitize Arriyadh Studio's
ordering and content-management processes.
