using System;

namespace Getränkehandel.Business.Model
{
    public class EinfacherArtikel : Artikel
    {
        private EinfacherArtikel(Action<object, string> lazyLoader) : base(lazyLoader)
        { }
        public EinfacherArtikel(string artikelBezeichnung) : base(artikelBezeichnung)
        { }
        public EinfacherArtikel(string artikelBezeichnung, string artikelBezeichnungKurz) : base(artikelBezeichnung, artikelBezeichnungKurz)
        { }
    }
}