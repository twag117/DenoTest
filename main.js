// main.js
// This will be our entry point for Deno Deploy

// Handle HTTP requests
Deno.serve(async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Root route
    if (path === "/") {
        return new Response("Welcome to my Deno Deploy API!", {
            headers: { "content-type": "text/plain" },
        });
    }

    // Time route
    if (path === "/time") {
        const time = new Date().toLocaleString();
        return new Response(`Current server time: ${time}`, {
            headers: { "content-type": "text/plain" },
        });
    }

    if (path === "/data") {
        const data = {
            message: "This is JSON data from Deno Deploy",
            timestamp: new Date(),
            environment: Deno.env.get("DENO_DEPLOYMENT_ID") ? "production" : "development",
        };

        return new Response(JSON.stringify(data, null, 2), {
            headers: { "content-type": "application/json" }
        });
    }

    // Handle 404
    return new Response("Not Found", { status: 404 });
});
