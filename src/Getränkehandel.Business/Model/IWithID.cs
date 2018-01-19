using System;

namespace Getränkehandel.Business.Model
{
    public interface IWithID<TID>
        where TID : IEquatable<TID>
    {
        TID ID { get; }
    }
}