using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.Data.Migrations
{
    /// <inheritdoc />
    public partial class UnreadCounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessageNotified");

            migrationBuilder.DropColumn(
                name: "ReceivedAll",
                table: "ChatMessages");

            migrationBuilder.AddColumn<DateTime>(
                name: "CurrentPushNotification",
                table: "ChatRoomUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CurrentSignalR",
                table: "ChatRoomUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastReadTime",
                table: "ChatRoomUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UnreadCount",
                table: "ChatRoomUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "ChatRoomUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CurrentPushNotification", "CurrentSignalR", "LastReadTime", "UnreadCount" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "ChatRoomUsers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CurrentPushNotification", "CurrentSignalR", "LastReadTime", "UnreadCount" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "ChatRoomUsers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CurrentPushNotification", "CurrentSignalR", "LastReadTime", "UnreadCount" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "ChatRoomUsers",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CurrentPushNotification", "CurrentSignalR", "LastReadTime", "UnreadCount" },
                values: new object[] { null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "ChatRoomUsers",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CurrentPushNotification", "CurrentSignalR", "LastReadTime", "UnreadCount" },
                values: new object[] { null, null, null, 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentPushNotification",
                table: "ChatRoomUsers");

            migrationBuilder.DropColumn(
                name: "CurrentSignalR",
                table: "ChatRoomUsers");

            migrationBuilder.DropColumn(
                name: "LastReadTime",
                table: "ChatRoomUsers");

            migrationBuilder.DropColumn(
                name: "UnreadCount",
                table: "ChatRoomUsers");

            migrationBuilder.AddColumn<bool>(
                name: "ReceivedAll",
                table: "ChatMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ChatMessageNotified",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Received = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessageNotified", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessageNotified_ChatMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "ChatMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChatMessageNotified_ChatRoomUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "ChatRoomUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessageNotified_MessageId",
                table: "ChatMessageNotified",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessageNotified_UserId",
                table: "ChatMessageNotified",
                column: "UserId");
        }
    }
}
