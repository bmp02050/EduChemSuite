using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduChemSuite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAngleTolerancePercentToExamQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AngleTolerancePercent",
                table: "ExamQuestions",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AngleTolerancePercent",
                table: "ExamQuestions");
        }
    }
}
