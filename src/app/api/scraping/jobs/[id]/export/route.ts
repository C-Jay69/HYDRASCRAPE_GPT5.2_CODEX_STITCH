import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraping/jobs/[id]/export - Export job data as CSV
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.scrapeJob.findUnique({
      where: { id: params.id },
      include: {
        products: true,
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Generate CSV content
    const headers = [
      'product_id',
      'product_url',
      'title',
      'description',
      'main_category',
      'sub_category',
      'price',
      'original_price',
      'currency',
      'shipping_cost',
      'shipping_time_estimate',
      'vendor_name',
      'vendor_rating',
      'product_rating',
      'review_count',
      'images_urls',
      'variant_options',
      'stock_status',
      'minimum_order_quantity',
      'weight',
      'dimensions',
      'sku',
      'date_scraped',
      'platform_source',
    ]

    const rows = job.products.map((product) => [
      product.productId,
      product.productUrl,
      escapeCsvField(product.title),
      escapeCsvField(product.description || ''),
      escapeCsvField(product.mainCategory || ''),
      escapeCsvField(product.subCategory || ''),
      product.price?.toString() || '',
      product.originalPrice?.toString() || '',
      product.currency || '',
      product.shippingCost?.toString() || '',
      escapeCsvField(product.shippingTimeEstimate || ''),
      escapeCsvField(product.vendorName || ''),
      product.vendorRating?.toString() || '',
      product.productRating?.toString() || '',
      product.reviewCount?.toString() || '',
      escapeCsvField(product.imagesUrls || ''),
      escapeCsvField(product.variantOptions || ''),
      escapeCsvField(product.stockStatus || ''),
      product.minimumOrderQuantity?.toString() || '',
      product.weight?.toString() || '',
      escapeCsvField(product.dimensions || ''),
      escapeCsvField(product.sku || ''),
      product.dateScraped.toISOString(),
      product.platformSource,
    ])

    // Create CSV with BOM for UTF-8 compatibility
    const bom = '\uFEFF'
    const csvContent = [
      bom,
      headers.join('|'),
      ...rows.map((row) => row.join('|')),
    ].join('\n')

    // Return as downloadable file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="scrapeforge-export-${job.id}-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting products:', error)
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    )
  }
}

// Helper function to escape CSV fields
function escapeCsvField(field: string): string {
  if (!field) return ''
  // Remove pipe characters and newlines
  return field.replace(/\|/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '')
}
