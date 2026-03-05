using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public class SendMessageModel
{
    [Required]
    public required Guid[] RecipientIds { get; set; }

    public Guid? ParentMessageId { get; set; }

    [Required]
    public required string Subject { get; set; }

    [Required]
    public required string Body { get; set; }
}
