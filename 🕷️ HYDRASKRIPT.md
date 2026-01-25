# 🕷️ HYDRASKRIPT

HYDRASKRIPT is a powerful, production-ready web scraping application built with Next.js 16, Tailwind CSS, and Playwright. It features a modern dashboard for managing scraping jobs, configuring scrapers, and viewing collected data.

## ✨ Features

*   **🚀 Next.js 16 & React 19**: Built on the latest web standards with App Router.
*   **🎭 Playwright Integration**: Full-browser scraping capabilities to handle dynamic JavaScript-heavy sites.
*   **🛡️ Anti-Detection**: Built-in mechanisms to handle headers, user agents, and proxy rotation (configurable).
*   **📊 Dashboard UI**: Beautiful, responsive interface built with Tailwind CSS and shadcn/ui, now updated with official brand colors.
*   **🗄️ Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod ready) for storing jobs, configs, and products.
*   **🐳 Docker Ready**: Optimized multi-stage Dockerfile for easy deployment.

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+ or Bun
*   Docker (optional, for containerized deployment)

### 🛠️ Local Development

1.  **Install Dependencies**
    ```bash
    pnpm install
    ```

2.  **Setup Database**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  **Run Development Server**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 🐳 Docker Deployment

HYDRASKRIPT includes a production-ready `Dockerfile` that handles the complex dependencies required for Playwright.

1.  **Build the Image**
    ```bash
    docker build -t hydraskript .
    ```

2.  **Run the Container**
    ```bash
    docker run -p 3000:3000 \
      -v "$(pwd)/db:/app/db" \
      -e DATABASE_URL="file:/app/db/custom.db" \
      hydraskript
    ```
    *Note: The `-v` flag persists your SQLite database outside the container.*

## 📁 Project Structure

*   `src/app`: Next.js App Router pages and API routes.
*   `src/components`: UI components (shadcn/ui).
*   `src/lib/scraping`: Core scraping logic (Playwright engine).
*   `prisma/schema.prisma`: Database schema definition.

## 🔧 Configuration

Scraping behavior can be customized via the dashboard or API:
*   **Rate Limiting**: Control request frequency.
*   **Proxy Rotation**: Configure proxy servers.
*   **Selectors**: Define CSS/XPath selectors for data extraction.

## 📝 License

Private / Proprietary
