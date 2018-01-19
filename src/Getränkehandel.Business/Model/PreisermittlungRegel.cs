namespace Getränkehandel.Business.Model
{
    public class PreisermittlungRegel
    {
        private int _preisermittlungID;
        public int PreisermittlungID => _preisermittlungID;
        private Preisermittlung _preisermittlung;
        public Preisermittlung Preisermittlung => _preisermittlung;
        private int _rang;
        public int Rang => _rang;
        public int PreislisteID { get; set; }
        public Preisliste Preisliste { get; set; }
    }
}