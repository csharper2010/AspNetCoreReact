using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Getränkehandel.Business.Model;
using Getränkehandel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Getränkehandel.Infrastructure.Repository
{
    public abstract class BaseRepository<TEntity, TID>
        where TEntity : class, IWithID<TID>
        where TID : struct, IEquatable<TID>
    {
        private readonly GetränkehandelContext dbContext;
        private readonly Func<GetränkehandelContext, DbSet<TEntity>> getDbSet;

        protected BaseRepository(GetränkehandelContext dbContext, Func<GetränkehandelContext, DbSet<TEntity>> getDbSet)
        {
            this.dbContext = dbContext;
            this.getDbSet = getDbSet;
        }

        public async Task<TEntity> GetById(int id)
        {
            var dbSet = getDbSet(dbContext);
            Expression<Func<TEntity, bool>> predicate = a => id.Equals(a.ID);
            var result = dbSet.Local.SingleOrDefault(a => a.ID.Equals(id));
            return result ?? await dbSet.SingleOrDefaultAsync(predicate);
        }

        public async Task<TEntity> Save(TEntity artikel) => (await dbContext.AddAsync(artikel)).Entity;
    }
}