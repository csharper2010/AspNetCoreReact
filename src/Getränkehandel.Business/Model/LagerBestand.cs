namespace Getränkehandel.Business.Model
{
    public class LagerBestand
    {
        private int _id;
        public int ID => _id;
        private int _artikelID;
        public int ArtikelID => _artikelID;
        private Artikel _artikel;
        public Artikel Artikel => _artikel;
        private int _lagerID;
        public int LagerID => _lagerID;
        private Lager _lager;
        public Lager Lager => _lager;
        public int Bestand { get; set; }
        public int Reservierung { get; set; }
    }
}