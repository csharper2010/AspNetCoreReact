namespace Getränkehandel.Business.Model
{
    public class Pfand : Abrechnungseintrag
    {
        private Pfand() : base()
        { }
        public Pfand(string bezeichnung) : base(bezeichnung)
        { }
        public Pfand(string bezeichnung, string bezeichnungKurz) : base(bezeichnung, bezeichnungKurz)
        { }
    }
}