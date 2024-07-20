using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IAccountTypeService : IBaseService<AccountType>
{
    Task<IEnumerable<AccountType>> List();
}

public class AccountTypeService(Context context, DbSet<AccountType> accountTypes)
    : BaseService<AccountType>(context, accountTypes), IAccountTypeService
{
    private readonly DbSet<AccountType> _accountTypes = accountTypes;

    public async Task<IEnumerable<AccountType>> List()
    {
        return await _accountTypes.ToListAsync();
    }
}