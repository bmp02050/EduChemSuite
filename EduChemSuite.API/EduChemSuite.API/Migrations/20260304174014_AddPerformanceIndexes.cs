using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduChemSuite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Grades_ExamId",
                table: "Grades");

            migrationBuilder.DropIndex(
                name: "IX_ExamResponses_ExamId",
                table: "ExamResponses");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Questions_IsActive",
                table: "Questions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_ExamId_UserId",
                table: "Grades",
                columns: new[] { "ExamId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_ExamResponses_ExamId_UserId",
                table: "ExamResponses",
                columns: new[] { "ExamId", "UserId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Questions_IsActive",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Grades_ExamId_UserId",
                table: "Grades");

            migrationBuilder.DropIndex(
                name: "IX_ExamResponses_ExamId_UserId",
                table: "ExamResponses");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_ExamId",
                table: "Grades",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamResponses_ExamId",
                table: "ExamResponses",
                column: "ExamId");
        }
    }
}
