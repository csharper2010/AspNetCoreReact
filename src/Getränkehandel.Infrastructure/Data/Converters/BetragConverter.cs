using System;
using System.Linq.Expressions;
using Getränkehandel.Business.Model;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore.Storage.Converters;

namespace Getränkehandel.Infrastructure.Data.Converters
{
    public class BetragConverter : ValueConverter<Betrag, decimal>
    {
        public BetragConverter(ConverterMappingHints mappingHints = default(ConverterMappingHints))
            : base(
                betrag => betrag.Value,
                value => new Betrag(value),
                mappingHints.IsEmpty ? new ConverterMappingHints(precision: 19, scale: 5) : mappingHints)
        {
        }

        private static Betrag DecimalToBetrag(decimal arg)
        {
            throw new NotImplementedException();
        }

        private static decimal BetragToDecimal(Betrag arg)
        {
            throw new NotImplementedException();
        }
    }
}