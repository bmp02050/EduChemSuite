using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduChemSuite.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedQuestionTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var types = new[]
            {
                "Multiple Choice",
                "True/False",
                "Essay",
                "Chemical Structure",
                "Atomic Structure",
                "Chemical Equation",
                "Electron Configuration",
                "Lewis Dot Structure",
                "Periodic Table Quiz",
                "Stoichiometry",
            };

            foreach (var type in types)
            {
                migrationBuilder.Sql($"""
                    INSERT INTO "QuestionTypes" ("Id", "Description", "IsActive", "CreatedAt")
                    SELECT gen_random_uuid(), '{type}', true, now()
                    WHERE NOT EXISTS (
                        SELECT 1 FROM "QuestionTypes" WHERE "Description" = '{type}'
                    );
                    """);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
