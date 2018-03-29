using System;
using System.ComponentModel.DataAnnotations;

namespace Getränkehandel.Business.Model
{
    public abstract class Abrechnungseintrag : IWithID<int>
    {
        protected Abrechnungseintrag(Action<object, string> lazyLoader)
        {
            LazyLoader = lazyLoader;
        }
        protected Abrechnungseintrag(string eintragBezeichnung, int fixedId = 0)
            : this(eintragBezeichnung, (eintragBezeichnung.Length > 26 ? eintragBezeichnung.Substring(0, 26) : eintragBezeichnung), fixedId: fixedId)
        { }
        protected Abrechnungseintrag(string eintragBezeichnung, string eintragBezeichnungKurz, int fixedId = 0)
        {
            Bezeichnung = eintragBezeichnung;
            BezeichnungKurz = eintragBezeichnungKurz;
            Aktiv = true;
            _id = fixedId;
        }
        private int _id;
        public int ID => _id;
        [StringLength(50)]
        public string Bezeichnung { get; set; }
        [StringLength(26)]
        public string BezeichnungKurz { get; set; }
        public bool Aktiv { get; set; }
        public string KurzCode { get; set; }
        protected Action<object, string> LazyLoader { get; }
    }
}