namespace App.Data.Entities;

public class PushNotificationLog
{
    public int UserId { get; set; }
    public DateTime? LastSentDateTime { get; set; }
    public int PendingCount { get; set; }
}
