// Vercel Serverless Function acting as an HTTPS-to-HTTP Gateway Proxy for EC2 backend
export default async function handler(req, res) {
  const EC2_HOST = process.env.EC2_BACKEND_URL || "http://32.197.235.108:5000"

  let targetPath = ""
  try {
    const urlObj = new URL(req.url, "http://localhost")
    const pathParam = urlObj.searchParams.get("__path")
    if (pathParam !== null) {
      urlObj.searchParams.delete("__path")
      const qs = urlObj.searchParams.toString()
      targetPath = `/api/${pathParam}${qs ? `?${qs}` : ""}`
    } else {
      // Fallback if accessed directly
      targetPath = req.url || "/api"
    }
  } catch {
    targetPath = req.url || "/api"
  }

  const targetUrl = `${EC2_HOST}${targetPath}`

  try {
    const headers = {}
    for (const [key, val] of Object.entries(req.headers || {})) {
      const lower = key.toLowerCase()
      if (
        lower !== "host" &&
        lower !== "content-length" &&
        lower !== "connection"
      ) {
        headers[key] = val
      }
    }

    const init = {
      method: req.method || "GET",
      headers,
    }

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl, init)
    const contentType = response.headers.get("content-type") || "application/json"
    const data = await response.text()

    res.status(response.status)
    res.setHeader("content-type", contentType)
    return res.send(data)
  } catch (err) {
    return res.status(502).json({
      success: false,
      error: "GatewayProxyError",
      message: `Failed to proxy to EC2 backend (${targetUrl}): ${err.message}`,
    })
  }
}
