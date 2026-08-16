namespace MLM.Application.DTOs.Payouts;

public class PayoutTransactionDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int StageId { get; set; }
    public string StageName { get; set; } = string.Empty;
    public decimal GrossAmount { get; set; }
    public decimal RetentionAmount { get; set; }
    public decimal NetPayoutAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
