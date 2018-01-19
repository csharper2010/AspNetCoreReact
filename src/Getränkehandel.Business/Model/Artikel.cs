namespace Getränkehandel.Business.Model
{
    public class Artikel : Abrechnungseintrag
    {
        private Artikel() : base()
        { }
        public Artikel(string bezeichnung) : base(bezeichnung)
        { }
        public Artikel(string bezeichnung, string bezeichnungKurz) : base(bezeichnung, bezeichnungKurz)
        { }
    }
}