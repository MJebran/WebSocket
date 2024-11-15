using System.Collections.Concurrent;
using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

var app = builder.Build();
app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
app.UseWebSockets();

var webSockets = new ConcurrentBag<WebSocket>();

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            Console.WriteLine("WebSocket Connected");

            webSockets.Add(webSocket);
            await HandleWebSocket(webSocket, webSockets);

            Console.WriteLine("WebSocket Disconnected");
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

static async Task HandleWebSocket(WebSocket currentSocket, ConcurrentBag<WebSocket> webSockets)
{
    var buffer = new byte[1024 * 4];
    while (currentSocket.State == WebSocketState.Open)
    {
        var receiveResult = await currentSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        if (receiveResult.MessageType == WebSocketMessageType.Text)
        {
            var message = System.Text.Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
            Console.WriteLine($"Received: {message}");

            // Broadcast the message to all connected clients
            foreach (var socket in webSockets)
            {
                if (socket != currentSocket && socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(
                        new ArraySegment<byte>(System.Text.Encoding.UTF8.GetBytes(message)),
                        WebSocketMessageType.Text,
                        true,
                        CancellationToken.None
                    );
                }
            }
        }
        else if (receiveResult.MessageType == WebSocketMessageType.Close)
        {
            webSockets.TryTake(out _); // Remove disconnected socket
            await currentSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
        }
    }
}

app.Run();
