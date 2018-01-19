using System;

namespace Getränkehandel.Business.Model
{
    public class Artikelpreis
    {
        private int _id;
        public int ID => _id;
        private int _preislisteID;
        public int PreislisteID => _preislisteID;
        private Preisliste _preisliste;
        public Preisliste Preisliste => _preisliste;
        private int _artikelID;
        public int ArtikelID => _artikelID;
        private Artikel _artikel;
        public Artikel Artikel => _artikel;
        public DateTime GültigAb { get; set; }
        public decimal? Preis { get; set; }
    }
}