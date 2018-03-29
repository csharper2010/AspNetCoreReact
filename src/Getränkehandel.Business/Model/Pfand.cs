using System;

namespace Getränkehandel.Business.Model
{
    public class Pfand : Abrechnungseintrag
    {
        private Pfand(Action<object, string> lazyLoader) : base(lazyLoader)
        { }
        public Pfand(string pfandBezeichnung, decimal betrag, int fixedId = 0) : base(pfandBezeichnung, fixedId: fixedId)
        {
            this.Betrag = betrag;
        }
        public Pfand(string pfandBezeichnung, string pfandBezeichnungKurz, decimal betrag, int fixedId = 0) : base(pfandBezeichnung, pfandBezeichnungKurz, fixedId: fixedId)
        {
            this.Betrag = betrag;
        }
        public decimal Betrag { get; private set; }
    }
}