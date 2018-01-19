namespace Getränkehandel.Business.Model
{
    public abstract class Abrechnungseintrag : IWithID<int>
    {
        protected Abrechnungseintrag()
        { }
        protected Abrechnungseintrag(string bezeichnung) : this(bezeichnung, (bezeichnung.Length > 26 ? bezeichnung.Substring(0, 26) : bezeichnung).ToUpper())
        { }
        protected Abrechnungseintrag(string bezeichnung, string bezeichnungKurz)
        {
            Bezeichnung = bezeichnung;
            BezeichnungKurz = bezeichnungKurz;
            Aktiv = true;
        }
        private int _id;
        public int ID => _id;
        public string Bezeichnung { get; set; }
        public string BezeichnungKurz { get; set; }
        public bool Aktiv { get; set; }
        public string KurzCode { get; set; }
    }
}