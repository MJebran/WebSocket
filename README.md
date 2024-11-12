
# WebSocket Project

This project is a simple WebSocket setup using a C# API with ASP.NET Core and a Vite client. It showcases a minimalistic approach to WebSocket server-client communication, suitable for real-time applications.

## Project Structure
```markdown
The project is organized as follows:

project-root
├── api
│   └── C# Web API (WebSocket setup)
└── client
    └── Vite Client (WebSocket communication)
```
- `api`: Contains the C# Web API for handling WebSocket connections.
- `client`: Contains the Vite client setup to connect to the WebSocket server.

### Initial Setup Instructions

To set up the project from scratch, follow these steps:

#### Step 1: Create the Project Structure

Run the following commands in your terminal:

```bash
mkdir api
```
```bash
mkdir client
```

#### Step 2: Set Up the API

1. Move into the `api` directory:

    ```bash
    cd api
    ```

2. Initialize a new C# Web API project:

    ```bash
    dotnet new web
    ```

3. After this, you’ll have a new ASP.NET Core Web API with WebSocket functionality.

#### Step 3: Set Up the Client

1. Move into the `client` directory:

    ```bash
    cd ..
    ```
    ```bash
    cd client
    ```

2. Initialize a new Vite project and install dependencies:

    ```bash
    npm create vite@latest .
    npm install
    ```

## WebSocket Server Setup

The WebSocket server is implemented in the C# API, listening at the `/ws` endpoint. Below is the setup and the code used to manage WebSocket connections.

### Program.cs Configuration

The code in `Program.cs` includes middleware to handle WebSocket requests and an `Echo` function that sends messages back to the client.

```csharp
using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Enable CORS to allow client connections
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

app.UseWebSockets();

// WebSocket handling middleware
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            Console.WriteLine("WebSocket Connected");
            await Echo(webSocket);
            Console.WriteLine("WebSocket closed");
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
    else
    {
        await next(context);
    }
});

app.Run();

// Echo function to handle WebSocket messages
static async Task Echo(WebSocket webSocket)
{
    var buffer = new byte[1024 * 4];
    var receiveResult = await webSocket.ReceiveAsync(
        new ArraySegment<byte>(buffer), CancellationToken.None);

    while (!receiveResult.CloseStatus.HasValue)
    {
        await webSocket.SendAsync(
            new ArraySegment<byte>(buffer, 0, receiveResult.Count),
            receiveResult.MessageType,
            receiveResult.EndOfMessage,
            CancellationToken.None);

        receiveResult = await webSocket.ReceiveAsync(
            new ArraySegment<byte>(buffer), CancellationToken.None);
    }

    await webSocket.CloseAsync(
        receiveResult.CloseStatus.Value,
        receiveResult.CloseStatusDescription,
        CancellationToken.None);
}
```

### Explanation of Code

- **WebSocket Middleware**: The middleware checks if the request is a WebSocket request at the `/ws` endpoint. If valid, it accepts the connection and calls the `Echo` function to handle communication.
- **Echo Function**: This function receives messages from the client and sends them back (echoes). The loop continues until the WebSocket connection is closed by the client.

### Key Code Snippets

The following snippets are used to create the WebSocket server functionality in the C# API.

#### WebSocket Request Handler

```csharp
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            await Echo(webSocket);
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
    else
    {
        await next(context);
    }
});
```

#### Echo Function

```csharp
private static async Task Echo(WebSocket webSocket)
{
    var buffer = new byte[1024 * 4];
    var receiveResult = await webSocket.ReceiveAsync(
        new ArraySegment<byte>(buffer), CancellationToken.None);

    while (!receiveResult.CloseStatus.HasValue)
    {
        await webSocket.SendAsync(
            new ArraySegment<byte>(buffer, 0, receiveResult.Count),
            receiveResult.MessageType,
            receiveResult.EndOfMessage,
            CancellationToken.None);

        receiveResult = await webSocket.ReceiveAsync(
            new ArraySegment<byte>(buffer), CancellationToken.None);
    }

    await webSocket.CloseAsync(
        receiveResult.CloseStatus.Value,
        receiveResult.CloseStatusDescription,
        CancellationToken.None);
}
```

## Additional Resources

To understand WebSockets in ASP.NET Core more thoroughly, refer to the [Microsoft WebSocket Documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/websockets?view=aspnetcore-8.0).

## Prerequisites

Make sure you have the following installed on your system:

- [.NET SDK](https://dotnet.microsoft.com/download) (for the C# API)
- [Node.js and npm](https://nodejs.org/) (for the Vite client)

## Running the Project

To run the WebSocket server and client:

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    ```

2. **Install dependencies**:

    - For the API: Navigate to `api` and restore dependencies with `dotnet restore`.
    - For the client: Navigate to `client` and install dependencies with `npm install`.

3. **Start the API**:

    ```bash
    cd api
    dotnet run
    ```

4. **Start the Client**:

    ```bash
    cd ../client
    npm run dev
    ```
---
