using System;
using System.Linq.Expressions;
using Getränkehandel.Business.Model;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Getränkehandel.Infrastructure.Data.ValueConversion
{
    public class BetragConverter : ValueConverter<Betrag, decimal>
    {
        public BetragConverter(ConverterMappingHints mappingHints = default(ConverterMappingHints))
            : base(
                betrag => betrag.Value,
                value => new Betrag(value),
                mappingHints == null ? new ConverterMappingHints(precision: 19, scale: 5) : mappingHints)
        {
        }

        // private static Betrag DecimalToBetrag(decimal arg)
        // {
        //     throw new NotImplementedException();
        // }

        // private static decimal BetragToDecimal(Betrag arg)
        // {
        //     throw new NotImplementedException();
        // }
    }
}