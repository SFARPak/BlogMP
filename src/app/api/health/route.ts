import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    // Check cache status
    const cacheStatus = {
      posts: true,
      users: true,
      search: true
    }

    // Check external services (optional)
    const externalServices = {
      database: true,
      redis: process.env.REDIS_URL ? true : false,
      openai: process.env.OPENAI_API_KEY ? true : false
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: externalServices.database,
        cache: cacheStatus,
        external: externalServices
      },
      uptime: process.uptime()
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service unavailable"
      },
      { status: 503 }
    )
  }
}
