using System.Linq;
using System.Threading.Tasks;
using Getränkehandel.Business.Model;
using Getränkehandel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Getränkehandel.Infrastructure.Repository
{
    public class ArtikelRepository : BaseRepository<Artikel, int>
    {
        public ArtikelRepository(GetränkehandelContext dbContext) : base(dbContext, c => c.Artikel)
        { }
    }
}