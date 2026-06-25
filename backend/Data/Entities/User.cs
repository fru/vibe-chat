namespace App.Data.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
}
