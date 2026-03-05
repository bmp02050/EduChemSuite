namespace EduChemSuite.API.Models;

public class MessageModel : BaseModel
{
    public Guid SenderId { get; set; }
    public Guid RecipientId { get; set; }
    public Guid ConversationId { get; set; }
    public Guid? ParentMessageId { get; set; }
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }

    public string? SenderName { get; set; }
    public string? SenderAccountType { get; set; }
    public string? RecipientName { get; set; }
    public string? RecipientAccountType { get; set; }

    public List<MessageModel>? Replies { get; set; }
}
