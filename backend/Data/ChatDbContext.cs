using App.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace App.Data;

public class ChatDbContext : DbContext
{
    public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<PushNotificationLog> PushNotificationLogs => Set<PushNotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(m => m.Content).IsRequired();
            entity.Property(m => m.Timestamp).HasDefaultValueSql("GETUTCDATE()");
            entity.HasIndex(m => new { m.IsDelivered, m.PushSent, m.Timestamp })
                .HasDatabaseName("IX_Messages_DeliveryStatus");
        });

        modelBuilder.Entity<PushNotificationLog>(entity =>
        {
            entity.HasKey(p => p.UserId);
        });
    }
}
