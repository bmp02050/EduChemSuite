using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduChemSuite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExamResponseGradingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCorrect",
                table: "ExamResponses",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGraded",
                table: "ExamResponses",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCorrect",
                table: "ExamResponses");

            migrationBuilder.DropColumn(
                name: "IsGraded",
                table: "ExamResponses");
        }
    }
}
