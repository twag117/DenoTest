// blog-api.js
// A simple in-memory blog API for Deno Deploy

// In-memory database (in production, you'd use a real database)
const posts = [
  {
    id: "1",
    title: "Introduction to Deno Deploy",
    content: "Deno Deploy is a distributed hosting service for Deno applications...",
    author: "Deno User",
    createdAt: "2025-05-01T10:00:00Z"
  },
  {
    id: "2",
    title: "Working with Deno KV",
    content: "Deno KV provides a simple key-value storage solution...",
    author: "Deno Fan",
    createdAt: "2025-05-02T14:30:00Z"
  }
];

// Helper to generate UUIDs
function generateId() {
  return crypto.randomUUID();
}

// Content type headers
const jsonHeaders = { "content-type": "application/json" };

// Parse request body as JSON
async function parseJsonBody(req) {
  try {
    return await req.json();
  } catch (e) {
    return null;
  }
}

// Handle HTTP requests
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // CORS headers for API access
  const headers = {
    ...jsonHeaders,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // GET /api/posts - List all posts
  if (path === "/api/posts" && req.method === "GET") {
    return new Response(JSON.stringify({ posts }), { headers });
  }
  
  // GET /api/posts/:id - Get a specific post
  if (path.match(/^\/api\/posts\/[\w-]+$/) && req.method === "GET") {
    const id = path.split("/").pop();
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), { 
        status: 404, 
        headers 
      });
    }
    
    return new Response(JSON.stringify({ post }), { headers });
  }
  
  // POST /api/posts - Create a new post
  if (path === "/api/posts" && req.method === "POST") {
    const body = await parseJsonBody(req);
    
    if (!body || !body.title || !body.content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required" }), 
        { status: 400, headers }
      );
    }
    
    const newPost = {
      id: generateId(),
      title: body.title,
      content: body.content,
      author: body.author || "Anonymous",
      createdAt: new Date().toISOString()
    };
    
    posts.push(newPost);
    
    return new Response(JSON.stringify({ post: newPost }), { 
      status: 201, 
      headers 
    });
  }
  
  // PUT /api/posts/:id - Update a post
  if (path.match(/^\/api\/posts\/[\w-]+$/) && req.method === "PUT") {
    const id = path.split("/").pop();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return new Response(JSON.stringify({ error: "Post not found" }), { 
        status: 404, 
        headers 
      });
    }
    
    const body = await parseJsonBody(req);
    
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }), 
        { status: 400, headers }
      );
    }
    
    // Update post fields
    const updatedPost = {
      ...posts[postIndex],
      title: body.title || posts[postIndex].title,
      content: body.content || posts[postIndex].content,
      author: body.author || posts[postIndex].author,
      updatedAt: new Date().toISOString()
    };
    
    posts[postIndex] = updatedPost;
    
    return new Response(JSON.stringify({ post: updatedPost }), { headers });
  }
  
  // DELETE /api/posts/:id - Delete a post
  if (path.match(/^\/api\/posts\/[\w-]+$/) && req.method === "DELETE") {
    const id = path.split("/").pop();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return new Response(JSON.stringify({ error: "Post not found" }), { 
        status: 404, 
        headers 
      });
    }
    
    const deletedPost = posts.splice(postIndex, 1)[0];
    
    return new Response(JSON.stringify({ 
      message: "Post deleted successfully",
      post: deletedPost
    }), { headers });
  }
  
  // Home route
  if (path === "/") {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Deno Deploy Blog API</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            pre {
              background-color: #f4f4f4;
              padding: 12px;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              font-family: monospace;
            }
            h1, h2 {
              color: #2563eb;
            }
          </style>
        </head>
        <body>
          <h1>Deno Deploy Blog API</h1>
          <p>Welcome to the Blog API! Here are the available endpoints:</p>
          
          <h2>Endpoints</h2>
          <ul>
            <li><code>GET /api/posts</code> - List all posts</li>
            <li><code>GET /api/posts/:id</code> - Get a specific post</li>
            <li><code>POST /api/posts</code> - Create a new post</li>
            <li><code>PUT /api/posts/:id</code> - Update a post</li>
            <li><code>DELETE /api/posts/:id</code> - Delete a post</li>
          </ul>
          
          <h2>Example</h2>
          <pre><code>
  // Example: Fetch all posts
  fetch('/api/posts')
    .then(response => response.json())
    .then(data => console.log(data));
          </code></pre>
          
          <div id="app">
            <h2>Posts</h2>
            <div id="posts-list">Loading...</div>
          </div>
          
          <script>
            // Fetch and display posts
            fetch('/api/posts')
              .then(response => response.json())
              .then(data => {
                const postsEl = document.getElementById('posts-list');
                postsEl.innerHTML = '';
                
                data.posts.forEach(post => {
                  const postEl = document.createElement('div');
                  postEl.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 100)}...</p>
                    <p><small>By ${post.author} on ${new Date(post.createdAt).toLocaleDateString()}</small></p>
                    <hr>
                  `;
                  postsEl.appendChild(postEl);
                });
              })
              .catch(err => {
                document.getElementById('posts-list').innerHTML = 
                  `<p>Error loading posts: ${err.message}</p>`;
              });
          </script>
        </body>
      </html>
    `, { headers: { "content-type": "text/html" } });
  }
  
  // Handle 404
  return new Response(JSON.stringify({ error: "Not Found" }), { 
    status: 404, 
    headers 
  });
});
