using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Getränkehandel.Business.Model;

namespace Getränkehandel.Business.Repository {
    public interface IRepository<TEntity, TID>
        where TEntity : class, IWithID<TID>
        where TID : struct, IEquatable<TID>
    {
        Task<TEntity> GetById(TID id);
        Task<TEntity> Save(TEntity entity);
        Task<IEnumerable<TEntity>> Find(Expression<Func<TEntity, bool>> predicate);
        void Delete(TEntity entity);
    }
}