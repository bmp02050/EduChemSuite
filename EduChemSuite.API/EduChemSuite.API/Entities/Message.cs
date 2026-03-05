namespace EduChemSuite.API.Entities;

public class Message : BaseEntity
{
    public required Guid SenderId { get; set; }
    public required Guid RecipientId { get; set; }
    public required Guid ConversationId { get; set; }
    public Guid? ParentMessageId { get; set; }
    public required string Subject { get; set; }
    public required string Body { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }

    public virtual User? Sender { get; set; }
    public virtual User? Recipient { get; set; }
    public virtual Message? ParentMessage { get; set; }
    public virtual ICollection<Message>? Replies { get; set; }
}
