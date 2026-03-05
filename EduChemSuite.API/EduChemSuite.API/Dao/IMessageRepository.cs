using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IMessageRepository
{
    Task<Message> Create(Message message);
    Task<Message?> GetById(Guid id);
    Task<IEnumerable<Message>> GetInbox(Guid userId);
    Task<IEnumerable<Message>> GetSent(Guid userId);
    Task<IEnumerable<Message>> GetConversation(Guid conversationId, Guid userId);
    Task<int> GetUnreadCount(Guid userId);
    Task MarkAsRead(Guid messageId, Guid userId);
    Task MarkConversationAsRead(Guid conversationId, Guid userId);
    Task<bool> Delete(Guid messageId, Guid userId);
}

public class MessageRepository(Context context, ILogger<MessageRepository> logger)
    : BaseService<Message>(context), IMessageRepository
{
    private readonly Context _context = context;

    public new async Task<Message> Create(Message message)
    {
        await _context.Messages.AddAsync(message);
        await _context.SaveChangesAsync();
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .FirstAsync(m => m.Id == message.Id);
    }

    public new async Task<Message?> GetById(Guid id)
    {
        return await _context.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .FirstOrDefaultAsync(m => m.Id == id && m.IsActive);
    }

    public async Task<IEnumerable<Message>> GetInbox(Guid userId)
    {
        // Get latest message per conversation for this user's inbox
        var latestPerConversation = await _context.Messages
            .AsNoTracking()
            .Where(m => m.RecipientId == userId && m.IsActive)
            .GroupBy(m => m.ConversationId)
            .Select(g => g.OrderByDescending(m => m.CreatedAt).First().Id)
            .ToListAsync();

        return await _context.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Where(m => latestPerConversation.Contains(m.Id))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetSent(Guid userId)
    {
        var latestPerConversation = await _context.Messages
            .AsNoTracking()
            .Where(m => m.SenderId == userId && m.IsActive)
            .GroupBy(m => m.ConversationId)
            .Select(g => g.OrderByDescending(m => m.CreatedAt).First().Id)
            .ToListAsync();

        return await _context.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Where(m => latestPerConversation.Contains(m.Id))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetConversation(Guid conversationId, Guid userId)
    {
        return await _context.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Where(m => m.ConversationId == conversationId
                        && m.IsActive
                        && (m.RecipientId == userId || m.SenderId == userId))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCount(Guid userId)
    {
        return await _context.Messages
            .AsNoTracking()
            .CountAsync(m => m.RecipientId == userId && !m.IsRead && m.IsActive);
    }

    public async Task MarkAsRead(Guid messageId, Guid userId)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.Id == messageId && m.RecipientId == userId && m.IsActive);

        if (message != null && !message.IsRead)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkConversationAsRead(Guid conversationId, Guid userId)
    {
        var unreadMessages = await _context.Messages
            .Where(m => m.ConversationId == conversationId
                        && m.RecipientId == userId
                        && !m.IsRead
                        && m.IsActive)
            .ToListAsync();

        foreach (var message in unreadMessages)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
        }

        if (unreadMessages.Count > 0)
            await _context.SaveChangesAsync();
    }

    public async Task<bool> Delete(Guid messageId, Guid userId)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.Id == messageId
                                      && (m.SenderId == userId || m.RecipientId == userId)
                                      && m.IsActive);

        if (message == null) return false;

        message.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
