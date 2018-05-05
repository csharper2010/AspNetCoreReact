using System;

namespace Getränkehandel.Business.Model
{
    public /* TEMP wegen #11692 abstract*/ class Artikel : Abrechnungseintrag
    {
        protected Artikel(Action<object, string> lazyLoader) : base(lazyLoader)
        { }
        public Artikel(string artikelBezeichnung) : base(artikelBezeichnung)
        { }
        public Artikel(string artikelBezeichnung, string artikelBezeichnungKurz) : base(artikelBezeichnung, artikelBezeichnungKurz)
        { }
        public int? PfandID { get; set; }
        private Pfand _pfand;
        public Pfand Pfand
        {
            get => LazyLoader.Load(this, ref _pfand);
            set => _pfand = value;
        }
    }
}