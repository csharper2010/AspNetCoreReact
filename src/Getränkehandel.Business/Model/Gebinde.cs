using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Getränkehandel.Business.Model
{
    public class Gebinde : Artikel
    {
        private Gebinde(Action<object, string> lazyLoader) : base(lazyLoader)
        { }
        public Gebinde(string gebindeBezeichnung) : base(gebindeBezeichnung)
        { }
        public Gebinde(string gebindeBezeichnung, string gebindeBezeichnungKurz) : base(gebindeBezeichnung, gebindeBezeichnungKurz)
        { }
        private List<GebindeInhalt> _inhalt = new List<GebindeInhalt>();
        public List<GebindeInhalt> Inhalt
        {
            get => LazyLoader.Load(this, ref _inhalt);
            set => _inhalt = value;
        }
    }

    public class GebindeInhalt : IWithID<int>
    {
        private GebindeInhalt() { }
        private GebindeInhalt(Action<object, string> lazyLoader)
        {
            LazyLoader = lazyLoader;
        }
        public GebindeInhalt(int menge, Artikel artikel)
        {
            _menge = menge;
            _artikel = artikel;
        }
        private int _id;
        public int ID => _id;
        private int _menge;
        public int Menge => _menge;
        private int _parentID;
        public int ParentID => _parentID;
        private Gebinde _parent;
        public Gebinde Parent => LazyLoader.Load(this, ref _parent);
        private int _artikelID;
        public int ArtikelID => _artikelID;
        private Artikel _artikel;
        [Required]
        public Artikel Artikel => LazyLoader.Load(this, ref _artikel);

        private Action<object, string> LazyLoader { get; }
    }
}