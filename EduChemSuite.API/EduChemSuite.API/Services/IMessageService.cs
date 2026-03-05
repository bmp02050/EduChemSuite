using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Hubs;
using EduChemSuite.API.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IMessageService
{
    Task<List<MessageModel>> Send(Guid senderId, SendMessageModel model);
    Task<IEnumerable<MessageModel>> GetInbox(Guid userId);
    Task<IEnumerable<MessageModel>> GetSent(Guid userId);
    Task<IEnumerable<MessageModel>> GetConversation(Guid conversationId, Guid userId);
    Task<int> GetUnreadCount(Guid userId);
    Task MarkAsRead(Guid messageId, Guid userId);
    Task MarkConversationAsRead(Guid conversationId, Guid userId);
    Task<bool> Delete(Guid messageId, Guid userId);
    Task<IEnumerable<UserSummaryModel>> GetMessageableUsers(Guid userId, AccountType callerRole);
}

public class MessageService(
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    IMapper mapper,
    IHubContext<MessageHub> hubContext,
    IUserScopingService userScopingService,
    Context context,
    ILogger<MessageService> logger) : IMessageService
{
    public async Task<List<MessageModel>> Send(Guid senderId, SendMessageModel model)
    {
        var sender = await context.Users.FirstOrDefaultAsync(u => u.Id == senderId && u.IsActive);
        if (sender == null) throw new UnauthorizedAccessException("Sender not found.");

        // Validate all recipients are within sender's scoped users
        var scopedQuery = await userScopingService.GetScopedUsersQuery(senderId, sender.AccountType);
        var allowedRecipientIds = await scopedQuery
            .Where(u => model.RecipientIds.Contains(u.Id) && u.Id != senderId)
            .Select(u => u.Id)
            .ToListAsync();

        var invalidRecipients = model.RecipientIds.Except(allowedRecipientIds).ToList();
        if (invalidRecipients.Count > 0)
            throw new UnauthorizedAccessException("One or more recipients are not accessible.");

        // Determine ConversationId
        Guid conversationId;
        if (model.ParentMessageId.HasValue)
        {
            var parentMessage = await messageRepository.GetById(model.ParentMessageId.Value);
            conversationId = parentMessage?.ConversationId ?? Guid.NewGuid();
        }
        else
        {
            conversationId = Guid.NewGuid();
        }

        var createdMessages = new List<MessageModel>();

        foreach (var recipientId in model.RecipientIds)
        {
            var message = new Message
            {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                RecipientId = recipientId,
                ConversationId = conversationId,
                ParentMessageId = model.ParentMessageId,
                Subject = model.Subject,
                Body = model.Body,
                IsRead = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await messageRepository.Create(message);
            var messageModel = mapper.Map<MessageModel>(created);
            createdMessages.Add(messageModel);

            // Push to recipient via SignalR
            var connectionIds = MessageHub.GetConnectionIds(recipientId.ToString()).ToList();
            if (connectionIds.Count > 0)
            {
                await hubContext.Clients.Clients(connectionIds)
                    .SendAsync("ReceiveMessage", messageModel);

                var unreadCount = await messageRepository.GetUnreadCount(recipientId);
                await hubContext.Clients.Clients(connectionIds)
                    .SendAsync("UpdateUnreadCount", unreadCount);
            }
        }

        return createdMessages;
    }

    public async Task<IEnumerable<MessageModel>> GetInbox(Guid userId)
    {
        return mapper.Map<IEnumerable<MessageModel>>(await messageRepository.GetInbox(userId));
    }

    public async Task<IEnumerable<MessageModel>> GetSent(Guid userId)
    {
        return mapper.Map<IEnumerable<MessageModel>>(await messageRepository.GetSent(userId));
    }

    public async Task<IEnumerable<MessageModel>> GetConversation(Guid conversationId, Guid userId)
    {
        return mapper.Map<IEnumerable<MessageModel>>(await messageRepository.GetConversation(conversationId, userId));
    }

    public async Task<int> GetUnreadCount(Guid userId)
    {
        return await messageRepository.GetUnreadCount(userId);
    }

    public async Task MarkAsRead(Guid messageId, Guid userId)
    {
        await messageRepository.MarkAsRead(messageId, userId);
    }

    public async Task MarkConversationAsRead(Guid conversationId, Guid userId)
    {
        await messageRepository.MarkConversationAsRead(conversationId, userId);
    }

    public async Task<bool> Delete(Guid messageId, Guid userId)
    {
        return await messageRepository.Delete(messageId, userId);
    }

    public async Task<IEnumerable<UserSummaryModel>> GetMessageableUsers(Guid userId, AccountType callerRole)
    {
        var scopedQuery = await userScopingService.GetScopedUsersQuery(userId, callerRole);
        var users = await scopedQuery
            .Where(u => u.Id != userId)
            .OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
            .ToListAsync();
        return mapper.Map<IEnumerable<UserSummaryModel>>(users);
    }
}
