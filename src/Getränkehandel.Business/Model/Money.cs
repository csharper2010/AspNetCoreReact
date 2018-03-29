using System;

namespace Getränkehandel.Business.Model
{
    public class Betrag : IEquatable<Betrag>, IComparable, IComparable<Betrag> {
        public Betrag(decimal value) {
            Value = value;
        }

        public decimal Value { get; }

        public static Betrag Zero { get; } = new Betrag(0m);

        public int CompareTo(Betrag other) => Value.CompareTo(other?.Value ?? decimal.MinValue);

        public int CompareTo(object obj) => CompareTo(obj as Betrag);

        public bool Equals(Betrag other) => other != null && Value.Equals(other.Value);

        public override bool Equals(object obj) => Equals(obj as Betrag);

        public override int GetHashCode() => Value.GetHashCode();
    }
}