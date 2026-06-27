using App.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace App.Data;

public class ChatDbContext : DbContext
{
    public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }

    public DbSet<ChatRoom> ChatRooms => Set<ChatRoom>();
    public DbSet<ChatRoomUser> ChatRoomUsers => Set<ChatRoomUser>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChatRoom>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.RoomName).HasMaxLength(100).IsRequired();
            entity.HasIndex(r => r.RoomName).IsUnique();
        });

        modelBuilder.Entity<ChatRoomUser>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).HasMaxLength(50).IsRequired();
            entity.HasOne(u => u.Room)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(u => new { u.RoomId, u.Username }).IsUnique();
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.HasOne(m => m.Room)
                .WithMany(r => r.Messages)
                .HasForeignKey(m => m.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(m => m.Username).HasMaxLength(50).IsRequired();
            entity.Property(m => m.Content).HasMaxLength(int.MaxValue).IsRequired();
            entity.Property(m => m.Timestamp).HasDefaultValueSql("GETUTCDATE()");
            entity.HasIndex(m => new { m.RoomId, m.Timestamp });
        });

        // Seed: "common" room with demo users A..E
        modelBuilder.Entity<ChatRoom>().HasData(new ChatRoom { Id = 1, RoomName = "common" });
        modelBuilder.Entity<ChatRoomUser>().HasData(
            new ChatRoomUser { Id = 1, RoomId = 1, Username = "A" },
            new ChatRoomUser { Id = 2, RoomId = 1, Username = "B" },
            new ChatRoomUser { Id = 3, RoomId = 1, Username = "C" },
            new ChatRoomUser { Id = 4, RoomId = 1, Username = "D" },
            new ChatRoomUser { Id = 5, RoomId = 1, Username = "E" }
        );
    }
}
