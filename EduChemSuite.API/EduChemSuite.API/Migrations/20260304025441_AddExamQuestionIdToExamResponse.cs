using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduChemSuite.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExamQuestionIdToExamResponse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ExamQuestionId",
                table: "ExamResponses",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamResponses_ExamQuestionId",
                table: "ExamResponses",
                column: "ExamQuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamResponses_ExamQuestions_ExamQuestionId",
                table: "ExamResponses",
                column: "ExamQuestionId",
                principalTable: "ExamQuestions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamResponses_ExamQuestions_ExamQuestionId",
                table: "ExamResponses");

            migrationBuilder.DropIndex(
                name: "IX_ExamResponses_ExamQuestionId",
                table: "ExamResponses");

            migrationBuilder.DropColumn(
                name: "ExamQuestionId",
                table: "ExamResponses");
        }
    }
}
