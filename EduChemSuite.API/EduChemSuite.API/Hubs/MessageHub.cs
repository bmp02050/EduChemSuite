using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace EduChemSuite.API.Hubs;

[Authorize]
public class MessageHub : Hub
{
    private static readonly ConcurrentDictionary<string, HashSet<string>> UserConnections = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("Id")?.Value;
        if (userId != null)
        {
            UserConnections.AddOrUpdate(userId,
                _ => new HashSet<string> { Context.ConnectionId },
                (_, connections) =>
                {
                    lock (connections) { connections.Add(Context.ConnectionId); }
                    return connections;
                });
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("Id")?.Value;
        if (userId != null && UserConnections.TryGetValue(userId, out var connections))
        {
            lock (connections)
            {
                connections.Remove(Context.ConnectionId);
                if (connections.Count == 0)
                    UserConnections.TryRemove(userId, out _);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public static IEnumerable<string> GetConnectionIds(string userId)
    {
        if (UserConnections.TryGetValue(userId, out var connections))
        {
            lock (connections) { return connections.ToList(); }
        }
        return Enumerable.Empty<string>();
    }
}
