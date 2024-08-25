using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduChemSuite.API.Migrations
{
    /// <inheritdoc />
    public partial class _2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schools_Districts_DistrictId",
                table: "Schools");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Districts_DistrictId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_DistrictId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Schools_DistrictId",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "DistrictId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DistrictId",
                table: "Schools");

            migrationBuilder.CreateTable(
                name: "DistrictSchools",
                columns: table => new
                {
                    DistrictId = table.Column<Guid>(type: "uuid", nullable: false),
                    SchoolId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DistrictSchools", x => new { x.DistrictId, x.SchoolId });
                    table.ForeignKey(
                        name: "FK_DistrictSchools_Districts_DistrictId",
                        column: x => x.DistrictId,
                        principalTable: "Districts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DistrictSchools_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDistrict",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DistrictId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDistrict", x => new { x.DistrictId, x.UserId });
                    table.ForeignKey(
                        name: "FK_UserDistrict_Districts_DistrictId",
                        column: x => x.DistrictId,
                        principalTable: "Districts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserDistrict_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DistrictSchools_SchoolId",
                table: "DistrictSchools",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDistrict_UserId",
                table: "UserDistrict",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DistrictSchools");

            migrationBuilder.DropTable(
                name: "UserDistrict");

            migrationBuilder.AddColumn<Guid>(
                name: "DistrictId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DistrictId",
                table: "Schools",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Users_DistrictId",
                table: "Users",
                column: "DistrictId");

            migrationBuilder.CreateIndex(
                name: "IX_Schools_DistrictId",
                table: "Schools",
                column: "DistrictId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schools_Districts_DistrictId",
                table: "Schools",
                column: "DistrictId",
                principalTable: "Districts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Districts_DistrictId",
                table: "Users",
                column: "DistrictId",
                principalTable: "Districts",
                principalColumn: "Id");
        }
    }
}
