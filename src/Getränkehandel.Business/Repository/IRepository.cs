using System;
using System.Threading.Tasks;
using Getränkehandel.Business.Model;

namespace Getränkehandel.Business.Repository {
    public interface IRepository<TEntity, TID>
        where TEntity : class, IWithID<TID>
        where TID : struct, IEquatable<TID>
    {
        Task<TEntity> GetById(TID id);
        Task<TEntity> Save(TEntity entity);
    }
}