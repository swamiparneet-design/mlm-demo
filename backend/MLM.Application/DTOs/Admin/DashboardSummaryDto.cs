namespace MLM.Application.DTOs.Admin;

public class DashboardSummaryDto
{
    public int TotalUsers { get; set; }
    public decimal TotalCollections { get; set; }
    public decimal TotalPayouts { get; set; }
    public decimal TotalRetainedAmount { get; set; }
}
