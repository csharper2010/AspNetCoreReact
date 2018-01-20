using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Getränkehandel.Business.Model;
using Getränkehandel.Infrastructure.Data;
using Getränkehandel.Repository;
using Microsoft.EntityFrameworkCore;

namespace Getränkehandel.Infrastructure.Repository
{
    public class BaseRepository<TEntity, TID> : IRepository<TEntity, TID>
        where TEntity : class, IWithID<TID>
        where TID : struct, IEquatable<TID>
    {
        private readonly GetränkehandelContext dbContext;

        public BaseRepository(GetränkehandelContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<TEntity> GetById(TID id)
        {
            var dbSet = dbContext.Set<TEntity>();
            Expression<Func<TEntity, bool>> predicate = a => id.Equals(a.ID);
            var result = dbSet.Local.SingleOrDefault(a => a.ID.Equals(id));
            return result ?? await dbSet.SingleOrDefaultAsync(predicate);
        }

        public async Task<TEntity> Save(TEntity entity) => (await dbContext.AddAsync(entity)).Entity;
    }
}