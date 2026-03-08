using System.Collections.Concurrent;

namespace EduChemSuite.API.Helpers;

public class AuthRateLimiter
{
    private readonly ConcurrentDictionary<string, List<DateTime>> _requests = new();
    private const int MaxRequests = 10;
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(15);

    public bool IsRateLimited(string ipAddress)
    {
        var now = DateTime.UtcNow;
        var timestamps = _requests.GetOrAdd(ipAddress, _ => new List<DateTime>());

        lock (timestamps)
        {
            timestamps.RemoveAll(t => now - t > Window);

            if (timestamps.Count >= MaxRequests)
                return true;

            timestamps.Add(now);
            return false;
        }
    }
}
