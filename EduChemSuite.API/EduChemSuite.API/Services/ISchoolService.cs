using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface ISchoolService : IBaseService<School>
{
}

public class SchoolService(Context context, DbSet<School> questionTags)
    : BaseService<School>(context, questionTags), ISchoolService
{
}