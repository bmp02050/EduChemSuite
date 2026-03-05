using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduChemSuite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExamAssignmentAndExamSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamResponses_Answers_AnswerId",
                table: "ExamResponses");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamResponses_ImageTypes_ImageTypeId",
                table: "ExamResponses");

            migrationBuilder.AddColumn<bool>(
                name: "AllowRetakes",
                table: "Exams",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxAttempts",
                table: "Exams",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TimeLimitMinutes",
                table: "Exams",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ImageTypeId",
                table: "ExamResponses",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "AnswerId",
                table: "ExamResponses",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "ExamId",
                table: "ExamResponses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "ExamAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamAssignments_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamAssignments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExamResponses_ExamId",
                table: "ExamResponses",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamAssignments_ExamId_UserId",
                table: "ExamAssignments",
                columns: new[] { "ExamId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamAssignments_UserId",
                table: "ExamAssignments",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResponses_Answers_AnswerId",
                table: "ExamResponses",
                column: "AnswerId",
                principalTable: "Answers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResponses_Exams_ExamId",
                table: "ExamResponses",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResponses_ImageTypes_ImageTypeId",
                table: "ExamResponses",
                column: "ImageTypeId",
                principalTable: "ImageTypes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamResponses_Answers_AnswerId",
                table: "ExamResponses");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamResponses_Exams_ExamId",
                table: "ExamResponses");

            migrationBuilder.DropForeignKey(
                name: "FK_ExamResponses_ImageTypes_ImageTypeId",
                table: "ExamResponses");

            migrationBuilder.DropTable(
                name: "ExamAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ExamResponses_ExamId",
                table: "ExamResponses");

            migrationBuilder.DropColumn(
                name: "AllowRetakes",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "MaxAttempts",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "TimeLimitMinutes",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "ExamId",
                table: "ExamResponses");

            migrationBuilder.AlterColumn<Guid>(
                name: "ImageTypeId",
                table: "ExamResponses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "AnswerId",
                table: "ExamResponses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResponses_Answers_AnswerId",
                table: "ExamResponses",
                column: "AnswerId",
                principalTable: "Answers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResponses_ImageTypes_ImageTypeId",
                table: "ExamResponses",
                column: "ImageTypeId",
                principalTable: "ImageTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
